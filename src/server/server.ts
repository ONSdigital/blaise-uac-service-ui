import express, {Request, Response} from "express";
import dotenv from "dotenv";
import GenerateUacsHandler from "./handlers/generate-uacs-handler";
import HealthCheckHandler from "./handlers/health-check-handler";
import FileExistsHandler from "./handlers/file-exists-handler";
import InstrumentListHandler from "./handlers/instrument-list-handler";
import GetFileWithUacsHandler from "./handlers/get-file-with-uacs-handler";

const server = express();

if (process.env.NODE_ENV !== "production") {
    dotenv.config({path: __dirname + "/../.env"});
}

//define express server config
server.use(express.json());
server.use(express.urlencoded({extended: true}));

//define handlers
server.use("/", GenerateUacsHandler());
server.use("/", GetFileWithUacsHandler());
server.use("/", FileExistsHandler());
server.use("/", InstrumentListHandler());
server.use("/", HealthCheckHandler());

//define entry point
server.get("*", function (req: Request, res: Response) {
    res.render("index.html");
});

export default server;