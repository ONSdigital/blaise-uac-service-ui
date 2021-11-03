import express, {Router, Request, Response} from "express";
import {getFileFromBucket} from "./../storage/google-storage-functions";
import BusApiClient from "blaise-uac-service-node-client";
import {addUacCodesToFile} from "../utils/csv-parser";

const router = express.Router();

export default function GetFileWithUacsHandler(busApiClient: BusApiClient, bucketName: string): Router {
    const sampleFileHandler = new SampleFileHandler(busApiClient, bucketName);
    return router.get("/api/v1/instrument/:instrumentName/uac/sample/:fileName", sampleFileHandler.GetSampleFileWithUacs);
}

export class SampleFileHandler {
    busApiClient: BusApiClient;
    bucketName: string;

    constructor(busApiClient: BusApiClient, bucketName: string) {
        this.busApiClient = busApiClient;
        this.bucketName = bucketName;
    }

    async GetSampleFileWithUacs(req: Request, res: Response): Promise<Response> {
        const { instrumentName } = req.params;
        const { fileName } = req.params;

        try {
            console.log("Get sample file from bucket");
            const fileBuffer = await getFileFromBucket(this.bucketName, fileName.toLowerCase());
            console.log("Got sample file from bucket");

            console.log("Get UAC details from BUS");
            const instrumentUacDetails = await this.busApiClient.getUacCodesByCaseId(instrumentName);
            console.log("Got UAC details from BUS");

            console.log("Add UAC details to file");
            const fileWithUacsArray = await addUacCodesToFile(fileBuffer, instrumentUacDetails);
            console.log("Added UAC details to file");

            return fileWithUacsArray.length === 0
                ? res.status(400).json()
                : res.status(200).json(fileWithUacsArray);
        } catch (error) {
            console.error(`Response: ${error}`);
            return res.status(500).json(`Get sample file with uacs failed for instrument ${instrumentName}`);
        }
    }
}
