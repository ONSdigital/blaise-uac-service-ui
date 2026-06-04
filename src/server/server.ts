import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { BlaiseApiClient } from "blaise-api-node-client";
import { Auth, newLoginHandler } from "blaise-login-react-server";
import { BusClient } from "blaise-uac-service-node-client";
import ejs from "ejs";
import express, { type Express, type NextFunction, type Request, type Response } from "express";

import createBlaiseHandler from "./handlers/blaiseHandler.js";
import createFileHandler from "./handlers/fileHandler.js";
import createHealthCheckHandler from "./handlers/healthCheckHandler.js";
import createImportUacHandler from "./handlers/importUacHandler.js";
import createQuestionnaireSamplesHandler from "./handlers/questionnaireSamplesHandler.js";
import createQuestionnaireUacHandler from "./handlers/questionnaireUacHandler.js";
import createUacHandler from "./handlers/uacHandler.js";
import createLogger from "./pinoLogger.js";
import { GoogleStorage } from "./storage/googleStorageFunctions.js";

import type { Config } from "./config.js";
import type { HttpLogger } from "pino-http";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function resolveClientBuildFolder(): string {
  const candidates = [
    path.resolve(process.cwd(), "build/client"),
    path.resolve(__dirname, "../../build/client"),
  ];

  return candidates.find((p) => fs.existsSync(p)) ?? candidates[0];
}

export function newServer(config: Config, logger: HttpLogger = createLogger()): Express {
  const server = express();

  const busClient = new BusClient(config.busUrl, config.busClientId);
  const googleStorage = new GoogleStorage(config.projectId);
  const blaiseApiClient = new BlaiseApiClient(config.blaiseApiUrl);
  const auth = new Auth(config);
  const loginHandler = newLoginHandler(auth, blaiseApiClient);

  const clientBuildFolder = resolveClientBuildFolder();
  const renderClientIndex = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const html = await ejs.renderFile(path.join(clientBuildFolder, "index.html"), {
        appConfigJson: JSON.stringify({
          projectId: config.projectId,
          urlDomain: config.urlDomain,
        }).replace(/</g, "\\u003c"),
      });

      res.send(html);
    } catch (err) {
      next(err);
    }
  };

  const errorPagePath = path.resolve(__dirname, "./views/500.html");
  const errorPageHtml = fs.existsSync(errorPagePath)
    ? fs.readFileSync(errorPagePath, "utf-8")
    : null;

  server.use(logger);

  server.use("/assets", express.static(path.join(clientBuildFolder, "assets")));
  server.get("/", renderClientIndex);
  server.get("/index.html", renderClientIndex);
  server.use(express.static(clientBuildFolder, { index: false }));

  server.use(express.json());
  server.use(express.urlencoded({ extended: true }));

  //define handlers
  server.use("/", createQuestionnaireUacHandler(busClient, googleStorage, config, auth));
  server.use("/", createFileHandler(googleStorage, config, auth));
  server.use("/", createQuestionnaireSamplesHandler(googleStorage, config, auth));
  server.use("/", createImportUacHandler(busClient, auth));
  server.use("/", createHealthCheckHandler());
  server.use("/", loginHandler);
  server.use("/", createUacHandler(busClient, auth, blaiseApiClient, config.serverPark));
  server.use("/", createBlaiseHandler(blaiseApiClient, config.serverPark, auth));

  server.get("/{*path}", renderClientIndex);

  server.use(function (err: Error, req: Request, res: Response, _next: NextFunction) {
    req.log.error(err, err.message);
    if (errorPageHtml) {
      res.status(500).type("text/html").send(errorPageHtml);

      return;
    }

    res.status(500).type("text/plain").send("Sorry, there is a problem with the service.");
  });

  return server;
}
