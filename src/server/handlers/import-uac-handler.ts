import express, { Router, Request, Response } from "express";
import BusApiClient from "blaise-uac-service-node-client";
import { getUacsFromFile } from "../utils/csv-parser";

export default function NewImportUacHandler(busApiClient: BusApiClient): Router {
  const router = express.Router();

  const importUacHandler = new ImportUacHandler(busApiClient);

  return router.post("/api/v1/uac/import", importUacHandler.ImportUacs);
}

export class ImportUacHandler {
  busAPIClient: BusApiClient;

  constructor(busApiClient: BusApiClient) {
    this.busAPIClient = busApiClient;
    this.ImportUacs = this.ImportUacs.bind(this);
  }

  async ImportUacs(req: Request, res: Response): Promise<Response> {
    const file = req.file;
    if (file == undefined) {
      return res.status(400).json("File not supplied");
    }

    try {
      const uacs = await getUacsFromFile(file.buffer);

      const importedUacs = await this.busAPIClient.importUACs(uacs);
      return res.status(200).json(importedUacs);
    } catch (error) {
      console.error(`Responnse: ${error}`);
      return res.status(500).json("Could not import uacs, please try again");
    }
  }
}
