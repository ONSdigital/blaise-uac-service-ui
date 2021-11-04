import express, {Request, Response, Router} from "express";
import {GoogleStorage} from "../storage/google-storage-functions";

const router = express.Router();

export default function FileExistsHandler(googleStorage: GoogleStorage, bucketName: string): Router {
    const fileHandler = new FileHandler(googleStorage, bucketName);
    return router.get("/api/v1/file/:fileName/exists", fileHandler.FileExists);
}

export class FileHandler {
    googleStorage: GoogleStorage;
    bucketName: string;

    constructor(googleStorage: GoogleStorage, bucketName: string) {
        this.bucketName = bucketName;
        this.googleStorage = googleStorage;
        this.FileExists = this.FileExists.bind(this);
    }

    async FileExists(req: Request, res: Response): Promise<Response> {
        const { fileName } = req.params;

        if (fileName === undefined) {
            console.error("FileName not supplied");
            return res.status(400).json("FileName not supplied");
        }

        const exists = await this.googleStorage.FileExistsInBucket(this.bucketName, fileName.toLowerCase());

        return res.status(200).json(exists);
    }
}
