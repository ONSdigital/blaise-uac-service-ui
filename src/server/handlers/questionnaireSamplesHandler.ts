import { type Auth } from "blaise-login-react-server";
import express, { type Request, type Response, type Router } from "express";

import { type GoogleStorage } from "../storage/googleStorageFunctions.js";

import type { Config } from "../config.js";

class QuestionnaireSamplesHandler {
  constructor(
    private readonly googleStorage: GoogleStorage,
    private readonly config: Config,
  ) {}

  getListOfQuestionnaireSamplesInBucket = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const files = await this.googleStorage.getFilesWithMetadataInBucket(this.config.bucketName);
      const questionnaires = files
        .filter((file) => file.name.endsWith(".csv"))
        .map((file) => ({
          questionnaireName: file.name.split(".").slice(0, -1).join(".").toUpperCase(),
          lastModified: file.updated,
        }));

      const dedupedQuestionnaires = Array.from(
        questionnaires
          .reduce((acc, item) => {
            const existing = acc.get(item.questionnaireName);

            if (
              !existing ||
              new Date(item.lastModified).getTime() > new Date(existing.lastModified).getTime()
            ) {
              acc.set(item.questionnaireName, item);
            }

            return acc;
          }, new Map<string, { questionnaireName: string; lastModified: string }>())
          .values(),
      );

      return res.status(200).json(dedupedQuestionnaires);
    } catch (error: unknown) {
      req.log.error(
        error instanceof Error ? error : new Error(String(error)),
        "Failed to retrieve questionnaire list",
      );

      return res.status(500).json("Failed to retrieve questionnaire list");
    }
  };
}

export default function createQuestionnaireSamplesHandler(
  googleStorage: GoogleStorage,
  config: Config,
  auth: Auth,
): Router {
  const router = express.Router();
  const handler = new QuestionnaireSamplesHandler(googleStorage, config);

  return router.get(
    "/api/v1/questionnaire-names",
    auth.middleware,
    handler.getListOfQuestionnaireSamplesInBucket,
  );
}
