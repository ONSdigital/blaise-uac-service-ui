import express, {Request, Response} from "express";
import dotenv from "dotenv";
import UacGenerationHandler from "./handlers/uac-generation-handler";
import HealthCheckHandler from "./handlers/health-check-handler";
import FileExistsHandler from "./handlers/file-exists-handler";
import InstrumentListHandler from "./handlers/instrument-list-handler";

const server = express();

if (process.env.NODE_ENV !== "production") {
    dotenv.config({path: __dirname + "/../.env"});
}

//define express server config
server.use(express.json());
server.use(express.urlencoded({extended: true}));

//define handlers
server.use("/", UacGenerationHandler());
server.use("/", FileExistsHandler());
server.use("/", InstrumentListHandler());
server.use("/", HealthCheckHandler());

//define entry point
server.get("*", function (req: Request, res: Response) {
    res.render("index.html");
});

export default server;