import { FileHandler } from "./file-handler";
import { getMockReq, getMockRes } from "@jest-mock/express";
import supertest, { Response } from "supertest";
import NewServer from "../server";
import BusApiClient from "blaise-uac-service-node-client";
import BlaiseApiClient from "blaise-api-node-client";
import { GetConfigFromEnv } from "../config";

import { Auth } from "blaise-login-react-server";
jest.mock("blaise-login-react-server", () => {
    const loginReact = jest.requireActual("blaise-login-react-server");
    return {
        ...loginReact
    };
});
Auth.prototype.ValidateToken = jest.fn().mockReturnValue(true);

//mock google storage
jest.mock("../storage/google-storage-functions");
import { GoogleStorage } from "../storage/google-storage-functions";
const fileExistsInBucketMock = jest.fn();
GoogleStorage.prototype.FileExistsInBucket = fileExistsInBucketMock;
const googleStorageMock = new GoogleStorage("ProjectID-mock");

const config = GetConfigFromEnv();
const busApiClient = new BusApiClient(config.BusApiUrl, config.BusClientId);
const blaiseApiClient = new BlaiseApiClient(config.BlaiseApiUrl);

const fileName = "DST2101A.csv";

const server = NewServer(busApiClient, googleStorageMock, config, blaiseApiClient);
const request = supertest(server);

describe("file-exists-handler tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    it("It should be called with correct parameters with filename converted to lowercase", async () => {
        fileExistsInBucketMock.mockImplementationOnce(() => {
            return Promise.resolve(true);
        });

        const response: Response = await request.get(`/api/v1/file/${fileName}/exists`);
        expect(response.status).toEqual(200);

        expect(fileExistsInBucketMock).toHaveBeenCalledWith("BucketName-mock", fileName.toLowerCase());
    });

    it("It should return a 200 response with true if the file exists", async () => {
        fileExistsInBucketMock.mockImplementationOnce(() => {
            return Promise.resolve(true);
        });

        const response: Response = await request.get(`/api/v1/file/${fileName}/exists`);
        expect(response.status).toEqual(200);
        expect(response.body).toEqual(true);
    });

    it("It should return a 200 response with false if the file does not exist", async () => {
        fileExistsInBucketMock.mockImplementationOnce(() => {
            return Promise.resolve(false);
        });

        const response: Response = await request.get(`/api/v1/file/${fileName}/exists`);
        expect(response.status).toEqual(200);
        expect(response.body).toEqual(false);
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });
});
