import express, { Router, Request, Response } from "express";
import BusApiClient from "blaise-uac-service-node-client";
import { Auth } from "blaise-login-react/blaise-login-react-server";

export default function NewUacHandler(busApiClient: BusApiClient, auth: Auth): Router {
    const router = express.Router();

    const uacHandler = new UacHandler(busApiClient);

    router.get("/api/v1/disableUac/:uac", auth.Middleware, uacHandler.DisableUac);
    router.get("/api/v1/enableUac/:uac", auth.Middleware, uacHandler.EnableUac);
    router.get("/api/v1/getDiabledUacs/:questionnaire", auth.Middleware, uacHandler.GetDisabledUacs);
    return router;
}

export class UacHandler {
    busApiClient: BusApiClient;

    constructor(busApiClient: BusApiClient) {
        this.busApiClient = busApiClient;
        this.DisableUac = this.DisableUac.bind(this);
        this.EnableUac = this.EnableUac.bind(this);
        this.GetDisabledUacs = this.GetDisabledUacs.bind(this);
    }

    async DisableUac(req: Request, res: Response): Promise<Response> {
        const { uac } = req.params;

        try {
            console.log(`Disabling UAC: ${uac}`);
            await this.busApiClient.disableUac(uac);

            console.log(`Successfully disabled UAC: ${uac}`);
            return res.status(201).json("Success");
        } catch (error: any) {
            console.log(`Disabling UAC: ${uac} failed...`);
            console.error(error);
            return res.status(500).json({ error: error });
        }
    }

    async EnableUac(req: Request, res: Response): Promise<Response> {
        const { uac } = req.params;

        try {
            console.log(`Enabling UAC: ${uac}`);
            await this.busApiClient.enableUac(uac);

            console.log(`Successfully enabled UAC: ${uac}`);
            return res.status(201).json("Success");
        } catch (error: any) {
            console.log(`Enabling UAC: ${uac} failed...`);
            console.error(error);
            return res.status(500).json({ error: error });
        }
    }

    async GetDisabledUacs(req: Request, res: Response): Promise<Response> {
        const { questionnaire } = req.params;

        try {
            console.log(`Get Disabled UACs: ${questionnaire}`);
            const response = await this.busApiClient.getDisabledUacCodes(questionnaire);
            console.log(`Successfully fetched disabled UACs: ${questionnaire}`);
            return res.status(200).json(response);
        } catch (error: any) {
            console.log(`Fetching Disabled UACs for questionnaire: ${questionnaire} failed...`);
            console.error(error);
            return res.status(500).json({ error: error });
        }
    }

}
