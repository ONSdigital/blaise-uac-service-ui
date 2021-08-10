import express, {Request, Response, Router} from "express";
import {uploadFile} from "../storage/storage";
import multer from "multer";
const upload = multer({dest: "/resources/temp/uploads/"});

export default function UploadSampleHandler(): Router {
    const router = express.Router();

    router.post("/api/v1/upload", upload.single("file"), uploadFile);

    return router;
}