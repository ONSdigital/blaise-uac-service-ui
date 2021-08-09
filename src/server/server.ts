import express, {Request, Response} from "express";
import {uploadFile} from "./storage/storage";
import multer from "multer";

const server = express();
const port = process.env.PORT || 5000;
const upload = multer({dest: "/resources/temp/uploads/"});

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

server.listen(port, () => console.log(`Listening on port ${port}`));

export default server;