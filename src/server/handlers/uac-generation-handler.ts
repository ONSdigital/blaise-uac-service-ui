import express, {Router, Request, Response} from "express";
import multer from "multer";
import {uploadFileToBucket} from "./../storage/google-storage-functions";
import {getEnvironmentVariables} from "../config";
import {BusApiClient} from "../api-clients/BusApiClient";

const router = express.Router();

export default function UacGenerationHandler(): Router {
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
        await uploadFile(fileName, file);

        return res.status(201).json(`Successfully generated uac codes for instrument ${instrumentName}`);
    } catch (error) {
        console.error(`Response: ${error}`);
        return res.status(500).json(`Generate UAC codes failed for instrument ${instrumentName}`);
    }
}

async function generateUacCodes(instrumentName: string, file: Express.Multer.File) {
    const {BUS_API_URL, BUS_CLIENT_ID} = getEnvironmentVariables();
    const busApiClient = new BusApiClient(BUS_API_URL, BUS_CLIENT_ID);

    await busApiClient.Meh();
}

async function uploadFile(fileName: string, file: Express.Multer.File) {
    const {BUCKET_NAME} = getEnvironmentVariables();

    await uploadFileToBucket(BUCKET_NAME, file, fileName.toLowerCase());
}