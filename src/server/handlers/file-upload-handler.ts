import express, {Router, Request, Response} from "express";
import multer from "multer";
import {uploadFileToBucket} from "./../storage/google-storage-functions";
import {getEnvironmentVariables} from "../config";

const router = express.Router();

export default function FileUploadHandler(): Router {
    const upload = multer({dest: "/resources/temp/uploads/"});

    return router.post("/api/v1/file/upload", upload.single("file"), uploadFile);
}

async function uploadFile(req: Request, res: Response): Promise<Response> {
    const instrumentName = req.body.instrumentName;
    if (instrumentName === undefined) {
        console.error("Instrument name not supplied");
        return res.status(400).json("Instrument name not supplied");
    }

    const file = req.file;
    if (file === undefined) {
        console.error("File not supplied");
         return res.status(400).json("File not supplied");
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