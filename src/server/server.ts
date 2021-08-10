import express, {Request, Response} from "express";
import dotenv from "dotenv";
import UploadSampleHandler from "./handlers/UploadSampleHandler";
import HealthCheckHandler from "./handlers/HealthCheckHandler";

const server = express();

if (process.env.NODE_ENV !== "production") {
    dotenv.config({path: __dirname + "/../.env"});
}

//define express server config
server.use(express.json());
server.use(express.urlencoded({extended: true}));

//define handlers
server.use("/", UploadSampleHandler());
server.use("/", HealthCheckHandler());

//define entry point
server.get("*", function (req: Request, res: Response) {
    res.render("index.html");
});

export default server;