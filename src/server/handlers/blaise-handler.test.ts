import supertest, { Response } from "supertest";
import { questionnaireList } from "../../mocks/api-mocks";
import { Auth } from "blaise-login-react/blaise-login-react-server";
import { NewServer } from "../server";
import BusApiClient from "blaise-uac-service-node-client";
import { GoogleStorage } from "../storage/google-storage-functions";
import { GetConfigFromEnv } from "../config";

jest.mock("blaise-login-react/blaise-login-react-server", () => {
    const loginReact = jest.requireActual("blaise-login-react/blaise-login-react-server");
    return {
        ...loginReact
    };
});
Auth.prototype.ValidateToken = jest.fn().mockReturnValue(true);

const config = GetConfigFromEnv();
const busApiClient = new BusApiClient(config.BusApiUrl, config.BusClientId);
const googleStorage = new GoogleStorage(config.ProjectID);

import BlaiseApiClient from "blaise-api-node-client";
jest.mock("blaise-api-node-client");
const mockGetQuestionnaires = jest.fn();
BlaiseApiClient.prototype.getQuestionnaires = mockGetQuestionnaires;
const BlaiseApiClientMock = new BlaiseApiClient(config.BlaiseApiUrl);

describe("BlaiseAPI Get all questionnaires from API", () => {
    const request = supertest(NewServer(busApiClient, googleStorage, config, BlaiseApiClientMock));

    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    it("blaise Api should be called with the correct BlaiseApiUrl & ServerPark", async () => {
        expect(config.BlaiseApiUrl).toStrictEqual("BlaiseApiUrl-mock");
        expect(config.ServerPark).toStrictEqual("ServerPark-mock");
    });

    it("should return a 200 status and an empty json list when API returns a empty list", async () => {
        mockGetQuestionnaires.mockImplementation(() => {
            return Promise.resolve([]);
        });

        const response = await request.get("/api/v1/questionnaires");
        console.log(response);
        expect(response.status).toEqual(200);
        expect(response.body).toHaveLength(0);
        expect(response.body).toStrictEqual([]);
    });

    it("should return a 200 status and a json list of 3 items when API returns a 3 item list", async () => {
        mockGetQuestionnaires.mockImplementation(() => {
            return Promise.resolve(questionnaireList);
        });

        await request.get("/api/v1/questionnaires").expect(200, questionnaireList);

    });

    it("should return a 500 status direct from the API", async () => {
        mockGetQuestionnaires.mockImplementation(() => {
            return Promise.reject();
        });

        const response: Response = await request.get("/api/v1/questionnaires");

        expect(response.status).toEqual(500);
    });
});

