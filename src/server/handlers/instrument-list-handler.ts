import express, {Request, Response, Router} from "express";
import {getEnvironmentVariables} from "../config";
import {getFilenamesInBucket} from "./../storage/google-storage-functions";

const router = express.Router();

export default function InstrumentListHandler(): Router {
    return router.get("/api/v1/instruments", GetListOfInstrumentsInBucket);
}

export async function GetListOfInstrumentsInBucket(req: Request, res: Response): Promise<Response> {
    const {BUCKET_NAME} = getEnvironmentVariables();
    const fileNames = await getFilenamesInBucket(BUCKET_NAME);
    const instrumentNames: Array<string> = [];

    fileNames.forEach(fileName => {
        if(!fileName.endsWith(".csv")) {
            return;
        }
        instrumentNames.push(fileName.split(".").slice(0, -1).join(".").toUpperCase());
    });

    return res.status(200).json(instrumentNames);
}
