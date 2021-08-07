import express, {Request, Response, NextFunction} from "express";
import {upload_file} from "./google-storage"

const server = express();
const port = process.env.PORT || 5000;

server.use(express.json());
server.use(express.urlencoded({ extended: true }));

server.get('/api/hello', (req: Request, res: Response) => {
    console.log(req.body);
    res.header('Content-Type', 'application/json');
    res.status(200).json({express: 'Hello From Express' });
});

server.post('/api/v1/upload', (req: Request, res: Response) => {
    console.log(req.body);
    res.setHeader('Content-Type', 'application/json');

    upload_file(req.body.instrumentName, req.body.file)
        .then(() => { console.log("req.body")});

    res.status(200).json(req.body.post);
});

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