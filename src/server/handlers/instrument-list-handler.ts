import express, {Request, Response, Router} from "express";
import {GoogleStorage} from "./../storage/google-storage-functions";

const router = express.Router();

export default function InstrumentListHandler(googleStorage: GoogleStorage, bucketName: string): Router {
    const instrumentHandler = new InstrumentHandler(googleStorage, bucketName);
    return router.get("/api/v1/instruments", instrumentHandler.GetListOfInstrumentsInBucket);
}

export class InstrumentHandler {
    googleStorage: GoogleStorage;
    bucketName: string;

    constructor(googleStorage: GoogleStorage, bucketName: string) {
        this.bucketName = bucketName;
        this.googleStorage = googleStorage;
        this.GetListOfInstrumentsInBucket = this.GetListOfInstrumentsInBucket.bind(this);
    }

    async GetListOfInstrumentsInBucket(req: Request, res: Response): Promise<Response> {
        const fileNames = await this.googleStorage.GetFileNamesInBucket(this.bucketName);
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
