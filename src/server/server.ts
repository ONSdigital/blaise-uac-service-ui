import express, {Request, Response} from "express";
import path from "path";
import ejs from "ejs";
import HealthCheckHandler from "./handlers/health-check-handler";
import NewFileHandler from "./handlers/file-handler";
import NewInstrumentListHandler from "./handlers/instrument-list-handler";
import { Config } from "./config";
import BusApiClient from "blaise-uac-service-node-client";
import { GoogleStorage } from "./storage/google-storage-functions";
import NewInstrumentUacHandler from "./handlers/instrument-uac-handler";

function NewServer(busApiClient: BusApiClient, googleStorage: GoogleStorage, config: Config): any {
    const server = express();
    const buildFolder = "../build";
    server.set("views", path.join(__dirname, buildFolder));
    server.engine("html", ejs.renderFile);
    server.use("/static", express.static(path.join(__dirname, `${buildFolder}/static`)));

    server.use(express.json());
    server.use(express.urlencoded({ extended: true }));

    //define handlers
    server.use("/api/v1/instrument/:instrumentName/uac", NewInstrumentUacHandler(busApiClient, googleStorage, config));
    server.use("/api/v1/file", NewFileHandler(googleStorage, config));
    server.use("/", NewInstrumentListHandler(googleStorage, config));
    server.use("/", HealthCheckHandler());

    //define entry point
    server.get("*", function (req: Request, res: Response) {
        res.render("index.html");
    });

    server.use(function (err: Error, req: Request, res: Response) {
        res.render("../src/views/500.html", {});
    });
    return server;
}

export default NewServer;
