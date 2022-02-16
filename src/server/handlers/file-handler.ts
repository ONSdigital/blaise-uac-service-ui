import express, { Request, Response, Router } from "express";
import { GoogleStorage } from "../storage/google-storage-functions";
import { Config } from "../config";
import { Auth } from "blaise-login-react-server";

export default function NewFileHandler(googleStorage: GoogleStorage, config: Config, auth: Auth): Router {
    const router = express.Router();
    const fileHandler = new FileHandler(googleStorage, config);
    return router.get("/api/v1/file/:fileName/exists", auth.Middleware, fileHandler.FileExists);
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

        const exists = await this.googleStorage.FileExistsInBucket(this.config.BucketName, fileName.toLowerCase());

        return res.status(200).json(exists);
    }
}
