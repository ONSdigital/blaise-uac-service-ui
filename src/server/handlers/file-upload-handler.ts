import express, {Router, Request, Response} from "express";
import multer from "multer";
import {uploadFileToBucket} from "./../storage/google-storage-functions";
import {getEnvironmentVariables} from "../config";

const upload = multer({dest: "/resources/temp/uploads/"});
const router = express.Router();

export default function FileUploadHandler(): Router {
    return router.post("/api/v1/file/upload", upload.single("file"), uploadFile);
}

async function uploadFile(req: Request, res: Response): Promise<Response> {
    const instrumentName = req.body.instrumentName;
    const file = req.file;

    if (instrumentName === undefined) {
        console.error("InstrumentName not supplied");
        return Promise.reject("Instrument name not supplied");
    }

    if (file === undefined) {
        console.error("File not supplied");
        return Promise.reject("File not supplied");
    }
    const {BUCKET_NAME} = getEnvironmentVariables();
    const sourceFilePath = `${file.path}`;
    const destinationFilePath = `${instrumentName.toLowerCase()}.csv`;

    return uploadFileToBucket(BUCKET_NAME, sourceFilePath, destinationFilePath)
        .then(() => {
            return res.status(201).json("Upload file successfully");
        })
        .catch((error: Error) => {
            console.error(`Response from Upload file to bucket: ${error}`);
            return Promise.reject("Upload file failed");
        });
}