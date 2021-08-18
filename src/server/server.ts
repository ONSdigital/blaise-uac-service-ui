import express, {Request, Response} from "express";
import dotenv from "dotenv";
import FileUploadHandler from "./handlers/file-upload-handler";
import HealthCheckHandler from "./handlers/health-check-handler";
import FileExistsHandler from "./handlers/file-exists-handler";
import UacHandler from "./handlers/uac-handler";

const server = express();

if (process.env.NODE_ENV !== "production") {
    dotenv.config({path: __dirname + "/../.env"});
}

//define express server config
server.use(express.json());
server.use(express.urlencoded({extended: true}));

//define handlers
server.use("/", FileUploadHandler());
server.use("/", FileExistsHandler());
server.use("/", UacHandler());
server.use("/", HealthCheckHandler());

//define entry point
server.get("*", function (req: Request, res: Response) {
    res.render("index.html");
});

export default server;