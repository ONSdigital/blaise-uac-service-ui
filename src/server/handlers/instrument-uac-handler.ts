import express, { Router, Request, Response } from "express";
import multer from "multer";
import { GoogleStorage } from "../storage/google-storage-functions";
import BusApiClient from "blaise-uac-service-node-client";
import { getCaseIdsFromFile, addUacCodesToFile } from "../utils/csv-parser";
import { Config } from "../config";


export default function NewInstrumentUacHandler(busApiClient: BusApiClient, googleStorage: GoogleStorage, config: Config): Router {
  const router = express.Router();
  const storage = multer.memoryStorage();
  const upload = multer({ storage: storage });

  const instrumentUacHandler = new InstrumentUacHandler(busApiClient, googleStorage, config);

  router.post("/sample", upload.single("file"), instrumentUacHandler.GenerateUacsForSampleFile);
  router.get("/sample/:fileName", instrumentUacHandler.GetSampleFileWithUacs);
  return router;
}

export class InstrumentUacHandler {
  busApiClient: BusApiClient;
  googleStorage: GoogleStorage;
  config: Config;

  constructor(busApiClient: BusApiClient, googleStorage: GoogleStorage, config: Config) {
    this.busApiClient = busApiClient;
    this.config = config;
    this.googleStorage = googleStorage;
    this.GenerateUacsForSampleFile = this.GenerateUacsForSampleFile.bind(this);
    this.GetSampleFileWithUacs = this.GetSampleFileWithUacs.bind(this);
  }

  async GenerateUacsForSampleFile(req: Request, res: Response): Promise<Response> {
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

  async GetSampleFileWithUacs(req: Request, res: Response): Promise<Response> {
    const { instrumentName } = req.params;
    const { fileName } = req.params;

    try {
      console.log("Get sample file from bucket");
      const fileBuffer = await this.googleStorage.GetFileFromBucket(this.config.BucketName, fileName.toLowerCase());
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

  async generateUacCodes(instrumentName: string, file: Express.Multer.File): Promise<void> {
    const caseIds = await getCaseIdsFromFile(file.buffer);

    await this.busApiClient.generateUacCodes(instrumentName, caseIds);
  }

  async uploadSampleFile(fileName: string, file: Express.Multer.File): Promise<void> {
    await this.googleStorage.UploadFileToBucket(this.config.BucketName, file, fileName.toLowerCase());
  }

}
