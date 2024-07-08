import express, { Request, Response, Router } from "express";
import { Auth } from "blaise-login-react/blaise-login-react-server";
import BlaiseApiClient, { Questionnaire } from "blaise-api-node-client";

export default function NewBlaiseHandler(blaiseApiClient: BlaiseApiClient, serverPark: string, auth: Auth): Router {
    const router = express.Router();

    const blaiseHandler = new BlaiseHandler(blaiseApiClient, serverPark);

    router.get("/api/questionnaires", auth.Middleware, blaiseHandler.GetQuestionnaires);

    return router;
}

export class BlaiseHandler {
    blaiseApiClient: BlaiseApiClient;
    serverPark: string;

    constructor(blaiseApiClient: BlaiseApiClient, serverPark: string) {
        this.blaiseApiClient = blaiseApiClient;
        this.serverPark = serverPark;

        this.GetQuestionnaires = this.GetQuestionnaires.bind(this);
    }

    async GetQuestionnaires(req: Request, res: Response): Promise<Response> {
        try {
            const questionnaires: Questionnaire[] = await this.blaiseApiClient.getQuestionnaires(this.serverPark);
            questionnaires.forEach(function (questionnaire: Questionnaire) {
                if (questionnaire.status === "Erroneous") {
                    req.log.info(`Questionnaire ${questionnaire.name} returned erroneous.`);
                    questionnaire.status = "Failed";
                }
                //questionnaire.fieldPeriod = fieldPeriodToText(questionnaire.name);
            });

            req.log.info({ questionnaires }, `${questionnaires.length} questionnaire/s currently installed.`);
            return res.status(200).json(questionnaires);
        } catch (error: any) {
            req.log.error(error, "Get questionnaires endpoint failed.");
            return res.status(500).json();
        }
    }
}
