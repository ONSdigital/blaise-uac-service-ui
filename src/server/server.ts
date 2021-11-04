import express, {Request, Response} from "express";
import dotenv from "dotenv";
import path from "path";
import ejs from "ejs";
import GenerateUacsHandler from "./handlers/generate-uacs-handler";
import HealthCheckHandler from "./handlers/health-check-handler";
import FileExistsHandler from "./handlers/file-exists-handler";
import InstrumentListHandler from "./handlers/instrument-list-handler";
import GetFileWithUacsHandler from "./handlers/get-file-with-uacs-handler";
import { getEnvironmentVariables } from "./config";
import BusApiClient from "blaise-uac-service-node-client";
import { GoogleStorage } from "./storage/google-storage-functions";

if (process.env.NODE_ENV !== "production") {
    dotenv.config({path: __dirname + "/../.env"});
}

const envConfig = getEnvironmentVariables();
const busApiClient = new BusApiClient(envConfig.BUS_API_URL, envConfig.BUS_CLIENT_ID);
const googleStorage = new GoogleStorage(envConfig.PROJECT_ID);

const server = express();
// treat the index.html as a template and substitute the values at runtime
const buildFolder = "../build";
server.set("views", path.join(__dirname, buildFolder));
server.engine("html", ejs.renderFile);
server.use("/static", express.static(path.join(__dirname, `${buildFolder}/static`)));

server.use(express.json());
server.use(express.urlencoded({extended: true}));

//define handlers
server.use("/", GenerateUacsHandler(busApiClient, googleStorage, envConfig.BUCKET_NAME));
server.use("/", GetFileWithUacsHandler(busApiClient, googleStorage, envConfig.BUCKET_NAME));
server.use("/", FileExistsHandler(googleStorage, envConfig.BUCKET_NAME));
server.use("/", InstrumentListHandler(googleStorage, envConfig.BUCKET_NAME));
server.use("/", HealthCheckHandler());

//define entry point
server.get("*", function (req: Request, res: Response) {
    res.render("index.html");
});

server.use(function (err: Error, req: Request, res: Response) {
    res.render("../src/views/500.html", {});
});

export default server;
