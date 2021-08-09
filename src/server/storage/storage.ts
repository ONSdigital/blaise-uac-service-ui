import {Request, Response} from "express";
import {uploadFileToBucket} from "./google-storage";
import {getEnvironmentVariables} from "../config";

export function uploadFile(req: Request, res: Response) {
    const instrumentName = req.body.instrumentName;
    const file = req.file;

    if (instrumentName === undefined) {
        console.error()
        res.status(400).json("Instrument name not supplied");
        return;
    }

    if (file === undefined) {
        console.error("File not supplied")
        res.status(400).json("File not supplied");
        return;
    }

    const environmentVariables = getEnvironmentVariables();
    const {BUCKET_NAME} = environmentVariables;
    const sourceFilePath = `${file.path}`;
    const destinationFilePath = `${instrumentName}.csv`

    uploadFileToBucket(BUCKET_NAME, sourceFilePath, destinationFilePath)
        .then(() => {
            res.status(200).json("Upload file successfully");
        })
        .catch((error: Error) => {
            console.error(`Response from Upload file to bucket: Error ${error}`);
            res.status(500).json(`Response from Upload file to bucket: Error ${error}`);
        });
}