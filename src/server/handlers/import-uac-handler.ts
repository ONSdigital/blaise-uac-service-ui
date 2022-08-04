import express, { Router, Request, Response } from "express";
import multer from "multer";
import BusApiClient from "blaise-uac-service-node-client";
import { getUacsFromFile } from "../utils/csv-parser";
import { Auth } from "blaise-login-react-server";

export default function NewImportUacHandler(busApiClient: BusApiClient, auth: Auth): Router {
    const router = express.Router();
    const storage = multer.memoryStorage();
    const upload = multer({ storage: storage });

    const importUacHandler = new ImportUacHandler(busApiClient);

    return router.post("/api/v1/uac/import", auth.Middleware, upload.single("file"), importUacHandler.ImportUacs);
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
          let uacsImported = 0;

          const chunkedUacs = this.sliceIntoChunks(uacs, 10_000);
          const parallelProcessChunks = this.sliceIntoChunks(chunkedUacs, 50);
          for (const processChunk of parallelProcessChunks) {
              const groupedAwait = processChunk.map(async(processUacs: string[]) => {
                  const importResponse = await this.busAPIClient.importUACs(processUacs);

                  return importResponse.uacs_imported;
              });
              const uacsImportedInProcess: number[] = await Promise.all(groupedAwait);
              console.log(uacsImportedInProcess);
              uacsImported += uacsImportedInProcess.reduce((partial_sum, a) => partial_sum + a, 0);
          }

          return res.status(200).json({ uacs_imported: uacsImported });
      } catch (error: any) {
          console.error(`Response error: ${error}`);
          if (error.response) {
              if (error.response.data.error) {
                  console.error(`Response error detail: ${error.response.data.error}`);
                  return res.status(error.response.status).json(error.response.data);
              } else {
                  console.error(`Response error detail: ${error.response.data}`);
              }
          }
          if (error.message.match("UAC column \".*\" not in CSV")) {
              return res.status(400).json({ error: error.message });
          }
          return res.status(500).json("Could not import uacs, please try again");
      }
  }

  sliceIntoChunks(array: string[] | string[][], chunkSize: number): any[] {
      const chunkedArray: any[] = [];
      for (let index = 0; index < array.length; index += chunkSize) {
          const chunk = array.slice(index, index+chunkSize);
          chunkedArray.push(chunk);
      }
      return chunkedArray;
  }
}
