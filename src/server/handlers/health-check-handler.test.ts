import BusApiClient from "blaise-uac-service-node-client";
import { GetConfigFromEnv } from "../config";
import NewServer from "../server";
import { GoogleStorage } from "../storage/google-storage-functions";

import supertest from "supertest";

const config = GetConfigFromEnv();
const busApiClient = new BusApiClient(config.BusApiUrl, config.BusClientId);
const googleStorage = new GoogleStorage(config.ProjectID);
const server = NewServer(busApiClient, googleStorage, config);
const request = supertest(server);

describe("Test Heath Endpoint", () => {
    it("should return a 200 status and json message", async () => {
        const response = await request.get("/bus-ui/version/health");

        expect(response.statusCode).toEqual(200);
        expect(response.body).toStrictEqual({healthy: true});
    });
});
