import express, {Request, Response} from "express";
import dotenv from "dotenv";
import path from "path";
import ejs from "ejs";
import GenerateUacsHandler from "./handlers/generate-uacs-handler";
import HealthCheckHandler from "./handlers/health-check-handler";
import FileExistsHandler from "./handlers/file-exists-handler";
import InstrumentListHandler from "./handlers/instrument-list-handler";
import GetFileWithUacsHandler from "./handlers/get-file-with-uacs-handler";


if (process.env.NODE_ENV !== "production") {
    dotenv.config({path: __dirname + "/../.env"});
}

const server = express();
// treat the index.html as a template and substitute the values at runtime
const buildFolder = "../../build";
server.set("views", path.join(__dirname, buildFolder));
server.engine("html", ejs.renderFile);
server.use("/static", express.static(path.join(__dirname, `${buildFolder}/static`)));


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