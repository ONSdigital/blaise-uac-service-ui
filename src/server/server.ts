import express, { NextFunction, Request, Response, Express } from "express";
import path from "path";
import ejs from "ejs";
import HealthCheckHandler from "./handlers/health-check-handler";
import NewFileHandler from "./handlers/file-handler";
import NewInstrumentListHandler from "./handlers/instrument-list-handler";
import NewInstrumentUacHandler from "./handlers/instrument-uac-handler";
import NewImportUacHandler from "./handlers/import-uac-handler";
import { Config } from "./config";
import { GoogleStorage } from "./storage/google-storage-functions";
import BusApiClient from "blaise-uac-service-node-client";
import BlaiseApiClient from "blaise-api-node-client";
import { newLoginHandler, Auth } from "blaise-login-react/blaise-login-react-server";
import createLogger from "./pino";
import PinoHttp from "pino-http";
import NewUacHandler from "./handlers/uac-handler";
import NewBlaiseHandler from "./handlers/blaise-handler";

class RequestLogger {
    logger: PinoHttp.HttpLogger

    constructor(logger: PinoHttp.HttpLogger) {
        this.logger = logger;
        this.logRequest = this.logRequest.bind(this);
    }

    async logRequest(request: Request, response: Response, next: NextFunction): Promise<void> {
        this.logger(request, response);
        if (request.method === "POST") {
            const requestBody = { ...request.body };
            if (requestBody?.password) {
                requestBody.password = "********";
            }
            console.log(requestBody);
        }
        next();
    }
}

export function NewServer(busApiClient: BusApiClient, googleStorage: GoogleStorage, config: Config, blaiseApiClient: BlaiseApiClient): Express {
    const server = express();
    const buildFolder = "../build";

    const auth = new Auth(config);
    const loginHandler = newLoginHandler(auth, blaiseApiClient);
    const logger = createLogger();
    const requestLogger = new RequestLogger(logger);

    server.use(logger);
    server.use(requestLogger.logRequest);

    server.set("views", path.join(__dirname, buildFolder));
    server.engine("html", ejs.renderFile);
    server.use("/static", express.static(path.join(__dirname, `${buildFolder}/static`)));

    server.use(express.json());
    server.use(express.urlencoded({ extended: true }));

    //define handlers
    server.use("/", NewInstrumentUacHandler(busApiClient, googleStorage, config, auth));
    server.use("/", NewFileHandler(googleStorage, config, auth));
    server.use("/", NewInstrumentListHandler(googleStorage, config, auth));
    server.use("/", NewImportUacHandler(busApiClient, auth));
    server.use("/", NewUacHandler(busApiClient, auth));
    server.use("/", NewBlaiseHandler(blaiseApiClient, config.ServerPark, auth));
    server.use("/", HealthCheckHandler());

    server.use("/", loginHandler);

    //define entry point
    server.get("*", function (req: Request, res: Response) {
        res.render("index.html");
    });

    server.use(function (err: Error, req: Request, res: Response) {
        logger(req, res);
        req.log.error(err, err.message);
        res.render("../src/views/500.html", {});
    });

    return server;
}
