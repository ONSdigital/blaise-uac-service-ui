import express, {Request, Response, Router} from "express";
import {getEnvironmentVariables} from "../config";
import {BusApiClient} from "../api-clients/BusApiClient";

const router = express.Router();

export default function UacHandler(): Router {
    return router.get("/api/v1/uac", Meh);
}

export async function Meh(req: Request, res: Response): Promise<Response> {
    const {BUS_API_URL, BUS_CLIENT_ID} = getEnvironmentVariables();
    const busApiClient = new BusApiClient(BUS_API_URL, BUS_CLIENT_ID);

    const response = await busApiClient.Meh();
    console.log("Handler meh", response);

    return res.status(200).json("testing 123455");
}