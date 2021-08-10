import {Request, Response} from "express";
import {uploadFileToBucket} from "./google-storage-functions";
import {getEnvironmentVariables} from "../config";

export async function uploadFile(req: Request, res: Response) {
    const instrumentName = req.body.instrumentName;
    const file = req.file;

    if (instrumentName === undefined) {
        console.error();
        return res.status(400).json("Instrument name not supplied");
    }

    if (file === undefined) {
        console.error("File not supplied");
        return res.status(400).json("File not supplied");
    }
    const {BUCKET_NAME} = getEnvironmentVariables();
    const sourceFilePath = `${file.path}`;
    const destinationFilePath = `${instrumentName}.csv`;

    return uploadFileToBucket(BUCKET_NAME, sourceFilePath, destinationFilePath)
        .then(() => {
            return res.status(200).json("Upload file successfully");
        })
        .catch((error: Error) => {
            console.error(`Response from Upload file to bucket: ${error}`);
            return res.status(500).json(`Response from Upload file to bucket: ${error}`);
        });
}