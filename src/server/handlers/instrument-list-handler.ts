import express, {Request, Response, Router} from "express";
import {GoogleStorage} from "./../storage/google-storage-functions";
import {Config} from "../config";

const router = express.Router();

export default function NewInstrumentListHandler(googleStorage: GoogleStorage, config: Config): Router {
    const instrumentHandler = new InstrumentListHandler(googleStorage, config);
    return router.get("/api/v1/instruments", instrumentHandler.GetListOfInstrumentsInBucket);
}

export class InstrumentListHandler {
    googleStorage: GoogleStorage;
    config: Config;

    constructor(googleStorage: GoogleStorage, config: Config) {
        this.config = config;
        this.googleStorage = googleStorage;
        this.GetListOfInstrumentsInBucket = this.GetListOfInstrumentsInBucket.bind(this);
    }

    async GetListOfInstrumentsInBucket(req: Request, res: Response): Promise<Response> {
        const fileNames = await this.googleStorage.GetFileNamesInBucket(this.config.BucketName);
        const instrumentNames: Array<string> = [];

        fileNames.forEach(fileName => {
            if (!fileName.endsWith(".csv")) {
                return;
            }
            instrumentNames.push(fileName.split(".").slice(0, -1).join(".").toUpperCase());
        });

        return res.status(200).json(instrumentNames);
    }
}
