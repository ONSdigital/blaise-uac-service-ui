import express, {Request, Response, Router} from "express";
import { GoogleStorage } from "../storage/google-storage-functions";
import { Config } from "../config";

const router = express.Router();

export default function NewFileHandler(googleStorage: GoogleStorage, config: Config): Router {
    const fileHandler = new FileHandler(googleStorage, config);
    return router.get("/:fileName/exists", fileHandler.FileExists);
}

export class FileHandler {
    googleStorage: GoogleStorage;
    config: Config;

    constructor(googleStorage: GoogleStorage, config: Config) {
        this.config = config;
        this.googleStorage = googleStorage;
        this.FileExists = this.FileExists.bind(this);
    }

    async FileExists(req: Request, res: Response): Promise<Response> {
        const { fileName } = req.params;

        if (fileName === undefined) {
            console.error("FileName not supplied");
            return res.status(400).json("FileName not supplied");
        }

        const exists = await this.googleStorage.FileExistsInBucket(this.config.BucketName, fileName.toLowerCase());

        return res.status(200).json(exists);
    }
}
