import express, {Request, Response, Router} from "express";
import {getEnvironmentVariables} from "../config";
import {fileExistsInBucket} from "../storage/google-storage-functions";

const router = express.Router();

export default function FileExistsHandler(): Router {
    return router.get("/api/v1/file/:fileName/exists", fileExists);
}

export async function fileExists(req: Request, res: Response): Promise<Response> {
    const {fileName} = req.params;

    if (fileName === undefined) {
        console.error("FileName not supplied");
        return res.status(400).json("FileName not supplied");
    }

    const {BUCKET_NAME} = getEnvironmentVariables();
    const exists = await fileExistsInBucket(BUCKET_NAME, fileName.toLowerCase());

    return res.status(200).json(exists);
}