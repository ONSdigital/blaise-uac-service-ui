import express, {Router, Request, Response} from "express";
import {getFileFromBucket} from "./../storage/google-storage-functions";
import {getEnvironmentVariables} from "../config";
import BusApiClient from "../api-clients/BusApi/bus-api-client";
import {addUacCodesToFile} from "../utils/csv-parser";

const router = express.Router();

export default function GetFileWithUacsHandler(): Router {
    return router.get("/api/v1/instrument/:instrumentName/uac/sample/:fileName", GetSampleFileWithUacs);
}

export async function GetSampleFileWithUacs(req: Request, res: Response): Promise<Response> {
    const {instrumentName} = req.params;
    const {fileName} = req.params;

    try {
        console.log("Get sample file from bucket");
        const fileBuffer = await getSampleFile(fileName);
        console.log("Got sample file from bucket");

        console.log("Get UAC details from BUS");
        const instrumentUacDetails = await getUacCodes(instrumentName);
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

async function getSampleFile(fileName: string) {
    const {BUCKET_NAME} = getEnvironmentVariables();

    return await getFileFromBucket(BUCKET_NAME, fileName.toLowerCase());
}

async function getUacCodes(instrumentName: string) {
    const {BUS_API_URL, BUS_CLIENT_ID} = getEnvironmentVariables();
    const busApiClient = new BusApiClient(BUS_API_URL, BUS_CLIENT_ID);

    return await busApiClient.getUacCodes(instrumentName);
}

