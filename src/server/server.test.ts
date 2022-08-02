import listEndpoints from "express-list-endpoints";
import BusApiClient from "blaise-uac-service-node-client";
import { GetConfigFromEnv } from "./config";
import { NewServer } from "./server";
import { GoogleStorage } from "./storage/google-storage-functions";
import BlaiseApiClient from "blaise-api-node-client";

describe("All expected routes are registered", () => {
    const expectedEndpoints = [
        {
            "methods": ["POST"],
            "middlewares": ["bound ", "multerMiddleware", "bound GenerateUacsForSampleFile"],
            "path": "/api/v1/instrument/:instrumentName/uac/sample"
        },
        {
            "methods": ["GET"],
            "middlewares": ["bound ", "bound GetSampleFileWithUacs"],
            "path": "/api/v1/instrument/:instrumentName/uac/sample/:fileName"
        },
        { "methods": ["GET"], "middlewares": ["bound ", "bound FileExists"], "path": "/api/v1/file/:fileName/exists" },
        { "methods": ["GET"], "middlewares": ["bound ", "bound GetListOfInstrumentsInBucket"], "path": "/api/v1/instruments" },
        { "methods": ["POST"], "middlewares": ["bound ", "multerMiddleware", "bound ImportUacs"], "path": "/api/v1/uac/import" },
        { "methods": ["GET"], "middlewares": ["healthCheck"], "path": "/bus-ui/:version/health" },        
        { "methods": ["GET"], "middlewares": ["bound ", ], "path": "/api/login/users/:username" },
        { "methods": ["GET"], "middlewares": ["bound ", ], "path": "/api/login/current-user" },
        { "methods": ["GET"], "middlewares": ["bound ", ], "path": "/api/login/users/:username/authorised" },
        { "methods": ["POST"], "middlewares": ["bound ", ], "path": "/api/login/token/validate" },
        { "methods": ["POST"], "middlewares": ["bound ", ], "path": "/api/login/users/password/validate" },
        { "methods": ["GET"], "middlewares": ["anonymous"], "path": "*" },

    ];

    it("should contain all expected routes", async () => {
        const config = GetConfigFromEnv();
        const busApiClient = new BusApiClient(config.BusApiUrl, config.BusClientId);
        const googleStorage = new GoogleStorage(config.ProjectID);
        const blaiseApiClient = new BlaiseApiClient(config.BlaiseApiUrl);
        const server = NewServer(busApiClient, googleStorage, config, blaiseApiClient);
        const endpoints = listEndpoints(server);

        expect(endpoints).toEqual(expectedEndpoints);
    });
});
