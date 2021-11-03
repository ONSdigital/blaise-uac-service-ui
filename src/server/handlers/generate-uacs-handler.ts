import express, {Router, Request, Response} from "express";
import multer from "multer";
import {uploadFileToBucket} from "../storage/google-storage-functions";
import BusApiClient from "blaise-uac-service-node-client";
import {getCaseIdsFromFile} from "../utils/csv-parser";

const router = express.Router();

export default function GenerateUacsHandler(busApiClient: BusApiClient, bucketName: string): Router {
    const storage = multer.memoryStorage();
    const upload = multer({storage: storage});

    const uacCodeGenerator = new UacCodeGenerator(busApiClient, bucketName);

    return router.post("/api/v1/instrument/:instrumentName/uac/sample", upload.single("file"), uacCodeGenerator.ForSampleFile);
}

export class UacCodeGenerator {
    busApiClient: BusApiClient;
    bucketName: string;

    constructor(busApiClient: BusApiClient, bucketName: string) {
        this.busApiClient = busApiClient;
        this.bucketName = bucketName;
    }

    async ForSampleFile(req: Request, res: Response): Promise<Response> {
        const { instrumentName } = req.params;

        const fileName = req.body.fileName;
        if (fileName === undefined) {
            return res.status(400).json("Filename not supplied");
        }

        const file = req.file;
        if (file === undefined) {
            return res.status(400).json("File not supplied");
        }

        try {
            await this.generateUacCodes(instrumentName, file);
            await this.uploadSampleFile(fileName, file);

            console.log("GenerateUacCodesForSampleFile - 201");
            return res.status(201).json("Success");
        } catch (error) {
            console.error(`Response: ${error}`);
            return res.status(500).json("Failure");
        }
    }

    async generateUacCodes(instrumentName: string, file: Express.Multer.File): Promise<void> {
        const caseIds = await getCaseIdsFromFile(file.buffer);

        await this.busApiClient.generateUacCodes(instrumentName, caseIds);
    }

    async uploadSampleFile(fileName: string, file: Express.Multer.File): Promise<void> {
        await uploadFileToBucket(this.bucketName, file, fileName.toLowerCase());
    }

}
