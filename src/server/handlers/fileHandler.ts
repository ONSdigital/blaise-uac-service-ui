import { type Auth } from "blaise-login-react-server";
import express, { type Request, type Response, type Router } from "express";

import { type GoogleStorage } from "../storage/googleStorageFunctions.js";
import { isValidSampleFileName } from "../validation.js";

import type { Config } from "../config.js";

class FileHandler {
  constructor(
    private readonly googleStorage: GoogleStorage,
    private readonly config: Config,
  ) {}

  fileExists = async (req: Request, res: Response): Promise<Response> => {
    const fileName = req.params.fileName;

    if (typeof fileName !== "string" || !isValidSampleFileName(fileName)) {
      return res.status(400).json("Invalid filename");
    }

    try {
      const questionnairePart = fileName.replace(/\.csv$/i, "");
      const canonicalFileName = `${questionnairePart.toUpperCase()}.csv`;
      const lowerCaseFileName = canonicalFileName.toLowerCase();

      const upperCaseExists = await this.googleStorage.fileExistsInBucket(
        this.config.bucketName,
        canonicalFileName,
      );

      if (upperCaseExists) {
        return res.status(200).json(true);
      }

      const exists = await this.googleStorage.fileExistsInBucket(
        this.config.bucketName,
        lowerCaseFileName,
      );

      return res.status(200).json(exists);
    } catch (error: unknown) {
      req.log.error(
        error instanceof Error ? error : new Error(String(error)),
        "File exists check failed",
      );

      return res.status(500).json("Checking file existence failed");
    }
  };
}

export default function createFileHandler(
  googleStorage: GoogleStorage,
  config: Config,
  auth: Auth,
): Router {
  const router = express.Router();
  const handler = new FileHandler(googleStorage, config);

  return router.get("/api/v1/file/:fileName/exists", auth.middleware, handler.fileExists);
}
