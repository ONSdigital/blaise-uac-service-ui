import { isAxiosError } from "axios";
import { type Auth } from "blaise-login-react-server";
import { type BusClient } from "blaise-uac-service-node-client";
import express, { type Request, type Response, type Router } from "express";
import multer from "multer";

import { getUsername } from "../helpers/getUsername.js";
import { getUacsFromFile } from "../utils/csvParser.js";
import { CsvValidationError, hasErrorMessage } from "../validation.js";

const FILE_SIZE_LIMIT = 100 * 1024 * 1024; // 100MB

type AuditLoggerLike = {
  info: (logger: Request["log"], message: string) => void;
  error: (logger: Request["log"], message: string) => void;
};

export class ImportUacHandler {
  constructor(
    private readonly busClient: BusClient,
    private readonly auth?: Auth,
    private readonly auditLogger?: AuditLoggerLike,
  ) {}

  importUacs = async (req: Request, res: Response): Promise<Response> => {
    const file = req.file;

    if (file === undefined) {
      return res.status(400).json("File not supplied");
    }

    try {
      const uacs = await getUacsFromFile(file.buffer);
      let uacsImported = 0;

      const chunkedUacs = this.sliceIntoChunks(uacs, 10_000);
      const parallelProcessChunks = this.sliceIntoChunks(chunkedUacs, 50);

      for (const processChunk of parallelProcessChunks) {
        const counts = await Promise.all(
          processChunk.map(async (processUacs) => {
            const importResponse = await this.busClient.importUacs(processUacs);

            return importResponse.uacs_imported;
          }),
        );

        uacsImported += counts.reduce((sum, n) => sum + n, 0);
      }

      if (this.auth && this.auditLogger) {
        const username = getUsername(req, this.auth);

        this.auditLogger.info(req.log, `${username} uploaded used UACs file ${file.originalname}`);
      }

      return res.status(200).json({ uacs_imported: uacsImported });
    } catch (error: unknown) {
      if (error instanceof CsvValidationError) {
        return res.status(400).json({ error: error.message });
      }

      req.log.error(
        error instanceof Error ? error : new Error(String(error)),
        "Import UACs failed",
      );

      if (this.auth && this.auditLogger) {
        const username = getUsername(req, this.auth);

        this.auditLogger.error(
          req.log,
          `${username} failed to upload used UACs file ${file.originalname}`,
        );
      }

      if (isAxiosError(error) && error.response) {
        const { status = 500, data } = error.response;

        if (hasErrorMessage(data)) {
          return res.status(status).json({ error: data.error });
        }
      }

      return res.status(500).json("Could not import uacs, please try again");
    }
  };

  private sliceIntoChunks<T>(array: T[], chunkSize: number): T[][] {
    const result: T[][] = [];

    for (let i = 0; i < array.length; i += chunkSize) {
      result.push(array.slice(i, i + chunkSize));
    }

    return result;
  }
}

export default function createImportUacHandler(
  busClient: BusClient,
  auth: Auth,
  auditLogger?: AuditLoggerLike,
): Router {
  const router = express.Router();
  const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: FILE_SIZE_LIMIT } });
  const handler = new ImportUacHandler(busClient, auth, auditLogger);

  return router.post(
    "/api/v1/uac/import",
    auth.middleware,
    upload.single("file"),
    handler.importUacs,
  );
}
