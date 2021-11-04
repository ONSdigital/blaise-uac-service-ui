import listEndpoints from "express-list-endpoints";

import BusApiClient from "blaise-uac-service-node-client";
import { GetConfigFromEnv } from "./config";
import NewServer from "./server";
import { GoogleStorage } from "./storage/google-storage-functions";

describe("All expected routes are registered", () => {
    const expectedEndpoints = [
        {
            "methods": ["POST"],
            "middlewares": ["multerMiddleware", "bound ForSampleFile"],
            "path": "/api/v1/instrument/:instrumentName/uac/sample"
        },
        {
            "methods": ["GET"],
            "middlewares": ["bound GetSampleFileWithUacs"],
            "path": "/api/v1/instrument/:instrumentName/uac/sample/:fileName"
        },
        {"methods": ["GET"], "middlewares": ["bound FileExists"], "path": "/api/v1/file/:fileName/exists"},
        {"methods": ["GET"], "middlewares": ["bound GetListOfInstrumentsInBucket"], "path": "/api/v1/instruments"},
        {"methods": ["GET"], "middlewares": ["healthCheck"], "path": "/bus-ui/:version/health"},
        {"methods": ["GET"], "middlewares": ["anonymous"], "path": "*"}];

    it("should contain all expected routes", async () => {
        const config = GetConfigFromEnv();
        const busApiClient = new BusApiClient(config.BusApiUrl, config.BusClientId);
        const googleStorage = new GoogleStorage(config.ProjectID);
        const server = NewServer(busApiClient, googleStorage, config);
        const endpoints = listEndpoints(server);

        expect(endpoints).toEqual(expectedEndpoints);
    });
});
