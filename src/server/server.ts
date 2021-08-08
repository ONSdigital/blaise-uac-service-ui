import express, {Request, Response, NextFunction} from "express";
import {upload_file} from "./google-storage"

const server = express();
const port = process.env.PORT || 5000;

const multer = require('multer');
const upload = multer({dest: "/resources/temp/uploads/"});

server.use(express.json());
server.use(express.urlencoded({extended: true}));
server.post('/api/v1/upload', upload.single('file'), uploadFiles);

function uploadFiles(req: Request, res: Response) {
    const instrumentName = req.body.instrumentName;
    const file = req.file;
    const filePath = `${file?.path}`;

    upload_file(instrumentName, filePath)
        .then(() => {
        });

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json("yo");
}

// Health Check endpoint
server.get("/uac-ui/:version/health", async function (req: Request, res: Response) {
    console.log("Heath Check endpoint called");
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({healthy: true});
});

server.get("*", function (req: Request, res: Response) {
    res.render("index.html");
});

server.use(function (err: Error, req: Request, res: Response, next: NextFunction) {
    res.render("../views/500.html", {});
});

server.listen(port, () => console.log(`Listening on port ${port}`));

export default server;