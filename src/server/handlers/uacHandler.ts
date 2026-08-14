import { type BlaiseApiClient } from "blaise-api-node-client";
import { type Auth } from "blaise-login-react-server";
import { type BusClient, BusClientError } from "blaise-uac-service-node-client";
import express, { type Request, type Response, type Router } from "express";

import { getUsername } from "../helpers/getUsername.js";
import { isValidQuestionnaireName, isValidUac } from "../validation.js";

type AuditLoggerLike = {
  info: (logger: Request["log"], message: string) => void;
  error: (logger: Request["log"], message: string) => void;
};

interface UacAuditContext {
  questionnaireName: string;
  caseId: string;
}

const UNKNOWN_CASE_ID = "unknown-case-id";

function caseIdOrUnknown(caseId: unknown): string {
  return typeof caseId === "string" && caseId.trim() !== "" ? caseId : UNKNOWN_CASE_ID;
}

function buildDisableAuditMessage(username: string, context: UacAuditContext): string {
  return `${username} disabled UAC for questionnaire ${context.questionnaireName} case ${context.caseId}`;
}

function buildDisableAuditFailureMessage(username: string, context: UacAuditContext): string {
  return `${username} failed to disable UAC for questionnaire ${context.questionnaireName} case ${context.caseId}`;
}

function buildEnableAuditMessage(username: string, context: UacAuditContext): string {
  return `${username} enabled UAC for questionnaire ${context.questionnaireName} case ${context.caseId}`;
}

function buildEnableAuditFailureMessage(username: string, context: UacAuditContext): string {
  return `${username} failed to enable UAC for questionnaire ${context.questionnaireName} case ${context.caseId}`;
}

function buildSafeErrorDetails(error: unknown): Record<string, unknown> {
  if (error instanceof BusClientError) {
    return {
      errorName: error.name,
      statusCode: error.statusCode ?? "unknown",
    };
  }

  if (error instanceof Error) {
    return {
      errorName: error.name,
    };
  }

  return {
    errorType: typeof error,
  };
}

export function compareDisabledUacRows(
  a: { questionnaire: string; caseId: string },
  b: { questionnaire: string; caseId: string },
): number {
  if (a.questionnaire < b.questionnaire) return -1;
  if (a.questionnaire > b.questionnaire) return 1;
  if (a.caseId < b.caseId) return -1;
  if (a.caseId > b.caseId) return 1;

  return 0;
}

class UacHandler {
  constructor(
    private readonly busClient: BusClient,
    private readonly auth: Auth,
    private readonly blaiseApiClient?: BlaiseApiClient,
    private readonly serverPark?: string,
    private readonly auditLogger?: AuditLoggerLike,
  ) {}

  private async findAuditContextForUac(uac: string, req: Request): Promise<UacAuditContext | null> {
    if (!this.blaiseApiClient || !this.serverPark) {
      return null;
    }

    try {
      const questionnaires = await this.blaiseApiClient.getQuestionnaires(this.serverPark);
      const activeQuestionnaires = questionnaires.filter(
        (q) => q.status === undefined || (q.status !== "Erroneous" && q.status !== "Failed"),
      );

      for (const q of activeQuestionnaires) {
        try {
          const disabledUacs = await this.busClient.getDisabledUacs(q.name);

          for (const uacObj of Object.values(disabledUacs)) {
            const disabledUac =
              uacObj.full_uac ??
              `${uacObj.uac_chunks.uac1}${uacObj.uac_chunks.uac2}${uacObj.uac_chunks.uac3}${uacObj.uac_chunks.uac4 ?? ""}`;

            if (disabledUac !== uac) {
              continue;
            }

            const caseId = typeof uacObj.case_id === "string" ? uacObj.case_id.trim() : "";

            if (caseId === "") {
              continue;
            }

            return {
              questionnaireName: (uacObj.questionnaire_name ?? q.name).toUpperCase(),
              caseId,
            };
          }
        } catch (error: unknown) {
          req.log.warn(
            {
              questionnaireName: q.name,
              errorName: error instanceof Error ? error.name : typeof error,
            },
            "Failed to fetch disabled UACs while resolving audit context",
          );
        }
      }
    } catch (error: unknown) {
      req.log.warn(
        {
          errorName: error instanceof Error ? error.name : typeof error,
        },
        "Failed to fetch questionnaires while resolving audit context",
      );
    }

    return null;
  }

  private auditInfo(
    req: Request,
    username: string,
    context: UacAuditContext | null,
    action: "disable" | "enable",
  ) {
    if (!context) {
      req.log.warn("Audit context lookup failed; skipping success audit event");

      return;
    }

    this.auditLogger?.info(
      req.log,
      action === "disable"
        ? buildDisableAuditMessage(username, context)
        : buildEnableAuditMessage(username, context),
    );
  }

  private auditError(
    req: Request,
    username: string,
    context: UacAuditContext | null,
    action: "disable" | "enable",
  ) {
    if (!context) {
      req.log.warn("Audit context lookup failed; skipping failure audit event");

      return;
    }

    this.auditLogger?.error(
      req.log,
      action === "disable"
        ? buildDisableAuditFailureMessage(username, context)
        : buildEnableAuditFailureMessage(username, context),
    );
  }

  getAllDisabledUacs = async (req: Request, res: Response): Promise<Response> => {
    if (!this.blaiseApiClient || !this.serverPark) {
      return res.status(500).json("Blaise API client not configured");
    }

    try {
      const questionnaires = await this.blaiseApiClient.getQuestionnaires(this.serverPark);
      const activeQuestionnaires = questionnaires.filter(
        (q) => q.status === undefined || (q.status !== "Erroneous" && q.status !== "Failed"),
      );
      const allResults: Array<{ questionnaire: string; caseId: string; uac: string }> = [];

      for (const q of activeQuestionnaires) {
        try {
          const disabledUacs = await this.busClient.getDisabledUacs(q.name);

          for (const uacObj of Object.values(disabledUacs)) {
            const uac =
              uacObj.full_uac ??
              `${uacObj.uac_chunks.uac1}${uacObj.uac_chunks.uac2}${uacObj.uac_chunks.uac3}${uacObj.uac_chunks.uac4 ?? ""}`;

            allResults.push({
              questionnaire: (uacObj.questionnaire_name ?? q.name).toUpperCase(),
              caseId: caseIdOrUnknown(uacObj.case_id),
              uac,
            });
          }
        } catch (err) {
          req.log.error(err, `Failed to fetch disabled UACs for questionnaire ${q.name}`);
        }
      }

      allResults.sort(compareDisabledUacRows);

      return res.status(200).json(allResults);
    } catch (error: unknown) {
      req.log.error(
        error instanceof Error ? error : new Error(String(error)),
        "Fetching all disabled UACs failed",
      );

      return res.status(500).json("Fetching all disabled UACs failed");
    }
  };

  disableUac = async (req: Request, res: Response): Promise<Response> => {
    const uac: string = req.body.uac;

    if (!uac || !isValidUac(uac)) {
      return res.status(400).json("Invalid UAC: must be exactly 12 digits");
    }

    const username = getUsername(req, this.auth);
    const beforeDisableContext = await this.findAuditContextForUac(uac, req);

    try {
      await this.busClient.disableUac(uac);
      const afterDisableContext = await this.findAuditContextForUac(uac, req);
      const auditContext = afterDisableContext ?? beforeDisableContext;

      req.log.info("Successfully disabled UAC");
      this.auditInfo(req, username, auditContext, "disable");

      return res.status(200).json("Success");
    } catch (error: unknown) {
      // The BUS client returns null on success but the client expects { message: string }.
      // A BusClientError with no statusCode means HTTP 200 was received but body
      // parsing failed, treat this as success.
      if (error instanceof BusClientError && error.statusCode === undefined) {
        const afterDisableContext = await this.findAuditContextForUac(uac, req);
        const auditContext = afterDisableContext ?? beforeDisableContext;

        req.log.info("Successfully disabled UAC");
        this.auditInfo(req, username, auditContext, "disable");

        return res.status(200).json("Success");
      }

      this.auditError(req, username, beforeDisableContext, "disable");

      req.log.error(
        beforeDisableContext
          ? {
              ...buildSafeErrorDetails(error),
              questionnaireName: beforeDisableContext.questionnaireName,
              caseId: beforeDisableContext.caseId,
            }
          : buildSafeErrorDetails(error),
        "Disable UAC failed",
      );

      return res.status(500).json("Disabling UAC failed");
    }
  };

  enableUac = async (req: Request, res: Response): Promise<Response> => {
    const uac: string = req.body.uac;

    if (!uac || !isValidUac(uac)) {
      return res.status(400).json("Invalid UAC: must be exactly 12 digits");
    }

    const username = getUsername(req, this.auth);
    const auditContext = await this.findAuditContextForUac(uac, req);

    try {
      await this.busClient.enableUac(uac);
      req.log.info("Successfully enabled UAC");
      this.auditInfo(req, username, auditContext, "enable");

      return res.status(200).json("Success");
    } catch (error: unknown) {
      // The BUS client returns null on success but the client expects { message: string }.
      // A BusClientError with no statusCode means HTTP 200 was received but body
      // parsing failed, treat this as success.
      if (error instanceof BusClientError && error.statusCode === undefined) {
        req.log.info("Successfully enabled UAC");
        this.auditInfo(req, username, auditContext, "enable");

        return res.status(200).json("Success");
      }

      this.auditError(req, username, auditContext, "enable");

      req.log.error(
        auditContext
          ? {
              ...buildSafeErrorDetails(error),
              questionnaireName: auditContext.questionnaireName,
              caseId: auditContext.caseId,
            }
          : buildSafeErrorDetails(error),
        "Enable UAC failed",
      );

      return res.status(500).json("Enabling UAC failed");
    }
  };

  getDisabledUacs = async (req: Request, res: Response): Promise<Response> => {
    const questionnaire = req.params.questionnaire;

    if (typeof questionnaire !== "string" || !isValidQuestionnaireName(questionnaire)) {
      return res.status(400).json("Invalid questionnaire name");
    }

    try {
      const response = await this.busClient.getDisabledUacs(questionnaire);

      req.log.info(`Successfully fetched disabled UACs for: ${questionnaire}`);

      return res.status(200).json(response);
    } catch (error: unknown) {
      req.log.error(
        error instanceof Error ? error : new Error(String(error)),
        `Fetching disabled UACs for ${questionnaire} failed`,
      );

      return res.status(500).json("Fetching disabled UACs failed");
    }
  };
}

export default function createUacHandler(
  busClient: BusClient,
  auth: Auth,
  blaiseApiClient?: BlaiseApiClient,
  serverPark?: string,
  auditLogger?: AuditLoggerLike,
): Router {
  const router = express.Router();
  const handler = new UacHandler(busClient, auth, blaiseApiClient, serverPark, auditLogger);

  router.post("/api/v1/uac/disable", auth.middleware, handler.disableUac);
  router.post("/api/v1/uac/enable", auth.middleware, handler.enableUac);
  router.get(
    "/api/v1/questionnaire/:questionnaire/disabled-uacs",
    auth.middleware,
    handler.getDisabledUacs,
  );
  router.get("/api/v1/disabled-uacs", auth.middleware, handler.getAllDisabledUacs);

  return router;
}
