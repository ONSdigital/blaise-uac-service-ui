import express, {Router, Request, Response} from "express";
import multer from "multer";
import {uploadFileToBucket} from "./../storage/google-storage-functions";
import {getEnvironmentVariables} from "../config";

const router = express.Router();

export default function FileUploadHandler(): Router {
    const storage = multer.memoryStorage();
    const upload = multer({storage: storage});

    return router.post("/api/v1/file/upload", upload.single("file"), uploadFile);
}

export async function uploadFile(req: Request, res: Response): Promise<Response> {
    const fileName = req.body.fileName;
    if (fileName === undefined) {
        console.error("Filename not supplied");
        return res.status(400).json("Filename not supplied");
    }

    const file = req.file;
    if (file === undefined) {
        console.error("File not supplied");
        return res.status(400).json("File not supplied");
    }

    const {BUCKET_NAME} = getEnvironmentVariables();

    return uploadFileToBucket(BUCKET_NAME, file, fileName.toLowerCase())
        .then(() => {
            return res.status(201).json("Upload file successfully");
        })
        .catch((error: Error) => {
            console.error(`Response from Upload file to bucket: ${error}`);
           return res.status(500).json("Upload file failed");
        });
}