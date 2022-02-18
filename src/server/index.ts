import BusApiClient from "blaise-uac-service-node-client";
import { GetConfigFromEnv } from "./config";
import { NewServer } from "./server";
import { GoogleStorage } from "./storage/google-storage-functions";
import BlaiseApiClient from "blaise-api-node-client";

const config = GetConfigFromEnv();
const busApiClient = new BusApiClient(config.BusApiUrl, config.BusClientId);
const googleStorage = new GoogleStorage(config.ProjectID);
const blaiseApiClient = new BlaiseApiClient(config.BlaiseApiUrl);
const app = NewServer(busApiClient, googleStorage, config, blaiseApiClient);
const port: string = process.env.PORT || "5000";

app.listen(port);

console.log("App is listening on port " + port);
