import { type BlaiseApiClient } from "blaise-api-node-client";
import { type Auth } from "blaise-login-react-server";
import { type BusClient, BusClientError } from "blaise-uac-service-node-client";
import express, { type Request, type Response, type Router } from "express";

import { isValidQuestionnaireName, isValidUac } from "../validation.js";

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
    private readonly blaiseApiClient?: BlaiseApiClient,
    private readonly serverPark?: string,
  ) {}

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
            if (!uacObj.case_id) {
              continue;
            }

            const uac =
              uacObj.full_uac ??
              `${uacObj.uac_chunks.uac1}${uacObj.uac_chunks.uac2}${uacObj.uac_chunks.uac3}${uacObj.uac_chunks.uac4 ?? ""}`;

            allResults.push({
              questionnaire: (uacObj.questionnaire_name ?? q.name).toUpperCase(),
              caseId: uacObj.case_id,
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

    try {
      await this.busClient.disableUac(uac);
      req.log.info("Successfully disabled UAC");

      return res.status(200).json("Success");
    } catch (error: unknown) {
      // The BUS client returns null on success but the client expects { message: string }.
      // A BusClientError with no statusCode means HTTP 200 was received but body
      // parsing failed, treat this as success.
      if (error instanceof BusClientError && error.statusCode === undefined) {
        req.log.info("Successfully disabled UAC");

        return res.status(200).json("Success");
      }

      req.log.error(
        error instanceof Error ? error : new Error(String(error)),
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

    try {
      await this.busClient.enableUac(uac);
      req.log.info("Successfully enabled UAC");

      return res.status(200).json("Success");
    } catch (error: unknown) {
      // The BUS client returns null on success but the client expects { message: string }.
      // A BusClientError with no statusCode means HTTP 200 was received but body
      // parsing failed, treat this as success.
      if (error instanceof BusClientError && error.statusCode === undefined) {
        req.log.info("Successfully enabled UAC");

        return res.status(200).json("Success");
      }

      req.log.error(error instanceof Error ? error : new Error(String(error)), "Enable UAC failed");

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
): Router {
  const router = express.Router();
  const handler = new UacHandler(busClient, blaiseApiClient, serverPark);

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
