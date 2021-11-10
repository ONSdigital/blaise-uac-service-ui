import BusApiClient from "blaise-uac-service-node-client";
import { GetConfigFromEnv } from "./config";
import NewServer from "./server";
import { GoogleStorage } from "./storage/google-storage-functions";

const port: string = process.env.PORT || "5000";

const config = GetConfigFromEnv();
const busApiClient = new BusApiClient(config.BusApiUrl, config.BusClientId);
const googleStorage = new GoogleStorage(config.ProjectID);
const app = NewServer(busApiClient, googleStorage, config);

app.listen(port);

console.log("App is listening on port " + port);
