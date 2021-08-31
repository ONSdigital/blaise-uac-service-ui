import express, {Router, Request, Response} from "express";
import multer from "multer";
import {uploadFileToBucket} from "../storage/google-storage-functions";
import {getEnvironmentVariables} from "../config";
import BusApiClient from "../api-clients/BusApi/bus-api-client";
import {getCaseIdsFromFile} from "../utils/csv-parser";
import {InstrumentUacDetails} from "../api-clients/BusApi/interfaces/instrument-uac-details";

const router = express.Router();

export default function GenerateUacsHandler(): Router {
    const storage = multer.memoryStorage();
    const upload = multer({storage: storage});

    return router.post("/api/v1/instrument/:instrumentName/uac/sample", upload.single("file"), GenerateUacCodesForSampleFile);
}

export async function GenerateUacCodesForSampleFile(req: Request, res: Response): Promise<Response> {
    const {instrumentName} = req.params;

    const fileName = req.body.fileName;
    if (fileName === undefined) {
        return res.status(400).json("Filename not supplied");
    }

    const file = req.file;
    if (file === undefined) {
        return res.status(400).json("File not supplied");
    }

    try {
        await generateUacCodes(instrumentName, file);
        await uploadSampleFile(fileName, file);

        console.log("GenerateUacCodesForSampleFile - 201");
        return res.status(201).json("Success");
    } catch (error) {
        console.error(`Response: ${error}`);
        return res.status(500).json("Failure");
    }
}

async function generateUacCodes(instrumentName: string, file: Express.Multer.File):Promise<InstrumentUacDetails> {
    const caseIds = await getCaseIdsFromFile(file.buffer);
    const {BUS_API_URL, BUS_CLIENT_ID} = getEnvironmentVariables();
    const busApiClient = new BusApiClient(BUS_API_URL, BUS_CLIENT_ID);

    return await busApiClient.generateUacCodes(instrumentName, caseIds);
}

async function uploadSampleFile(fileName: string, file: Express.Multer.File) {
    const {BUCKET_NAME} = getEnvironmentVariables();

    await uploadFileToBucket(BUCKET_NAME, file, fileName.toLowerCase());
}