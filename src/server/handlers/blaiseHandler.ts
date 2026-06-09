import { type BlaiseApiClient } from "blaise-api-node-client";
import { type Auth } from "blaise-login-react-server";
import express, { type Request, type Response, type Router } from "express";

import type { QuestionnaireSummary } from "../validation.js";

class BlaiseHandler {
  constructor(
    private readonly blaiseApiClient: BlaiseApiClient,
    private readonly serverPark: string,
  ) {}

  getQuestionnaires = async (req: Request, res: Response): Promise<Response> => {
    try {
      const questionnaires = await this.blaiseApiClient.getQuestionnaires(this.serverPark);
      const questionnaireSummaries: QuestionnaireSummary[] = questionnaires.map(({ name }) => ({
        name,
      }));
      const erroneousQuestionnaires = questionnaires
        .filter((q) => q.status === "Erroneous")
        .map((q) => q.name);

      req.log.info(
        { questionnaireCount: questionnaireSummaries.length, erroneousQuestionnaires },
        `${questionnaireSummaries.length} questionnaire/s currently installed.`,
      );

      return res.status(200).json(questionnaireSummaries);
    } catch (error: unknown) {
      req.log.error(
        error instanceof Error ? error : new Error(String(error)),
        "Get questionnaires endpoint failed.",
      );

      return res.status(500).json();
    }
  };
}

export default function createBlaiseHandler(
  blaiseApiClient: BlaiseApiClient,
  serverPark: string,
  auth: Auth,
): Router {
  const router = express.Router();
  const handler = new BlaiseHandler(blaiseApiClient, serverPark);

  router.get("/api/v1/questionnaires", auth.middleware, handler.getQuestionnaires);

  return router;
}
