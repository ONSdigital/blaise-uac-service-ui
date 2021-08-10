import express, {Request, Response} from "express";
import {uploadFile} from "./storage/storage";
import multer from "multer";
import dotenv from "dotenv";

const server = express();
const upload = multer({dest: "/resources/temp/uploads/"});

if (process.env.NODE_ENV !== "production") {
    dotenv.config({path: __dirname + "/../.env"});
}

server.use(express.json());
server.use(express.urlencoded({extended: true}));

server.post("/api/v1/upload", upload.single("file"), uploadFile);

// Health Check endpoint
server.get("/uac-ui/:version/health", async function (req: Request, res: Response) {
    console.log("Heath Check endpoint called");
    res.status(200).json({healthy: true});
});

server.get("*", function (req: Request, res: Response) {
    res.render("index.html");
});

export default server;