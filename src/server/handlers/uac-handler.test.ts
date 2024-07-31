import supertest from "supertest";
// import { questionnaireList } from "../../mocks/api-mocks";
import { Auth } from "blaise-login-react/blaise-login-react-server";
import { NewServer } from "../server";
import BusApiClient from "blaise-uac-service-node-client";
import { GoogleStorage } from "../storage/google-storage-functions";
import { GetConfigFromEnv } from "../config";
import BlaiseApiClient from "blaise-api-node-client";
import { disabledUacCodesForQuestionnaireMock } from "../../mocks/api-mocks";

jest.mock("blaise-login-react/blaise-login-react-server", () => {
    const loginReact = jest.requireActual("blaise-login-react/blaise-login-react-server");
    return {
        ...loginReact
    };
});
Auth.prototype.ValidateToken = jest.fn().mockReturnValue(true);

const config = GetConfigFromEnv();
const blaiseApiClient = new BlaiseApiClient(config.BlaiseApiUrl);
const googleStorage = new GoogleStorage(config.ProjectID);

//mock bus api
jest.mock("blaise-uac-service-node-client");
const mockDisableUac = jest.fn();
const mockEnableUac = jest.fn();
const mockGetDisabledUacs = jest.fn();
BusApiClient.prototype.disableUac = mockDisableUac;
BusApiClient.prototype.enableUac = mockEnableUac;
BusApiClient.prototype.getDisabledUacCodes = mockGetDisabledUacs;
const busApiClientMock = new BusApiClient(config.BusApiUrl, config.BusClientId);

describe("Environment variables are correctly set for Bus Api Client ", () => {
    supertest(NewServer(busApiClientMock, googleStorage, config, blaiseApiClient));

    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    it("bus Api should be called with the correct BusApiUrl & BusClientId", async () => {
        expect(config.BusApiUrl).toStrictEqual("BusApiUrl-mock");
        expect(config.BusClientId).toStrictEqual("BusClientId-mock");
    });
});

describe("BusClientApi works and disable functionality works correctly", () => {
    const request = supertest(NewServer(busApiClientMock, googleStorage, config, blaiseApiClient));

    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    it("should return a 200 status and disables the uac code received in url", async () => {

        mockDisableUac.mockImplementation(() => {
            return Promise.resolve("Success");
        });

        const response = await request.get("/api/v1/disableUac/123456789123");
        expect(mockDisableUac).toBeCalledWith("123456789123");
        expect(response.status).toEqual(200);
        expect(response.body).toStrictEqual("Success");
    });

    it("should return a 500 status and error if uac is not valid", async () => {
        const invalid_uac = "123";
        mockDisableUac.mockImplementation(() => {
            return Promise.reject(`Disabling UAC: ${invalid_uac} failed`);
        });

        const response = await request.get(`/api/v1/disableUac/${invalid_uac}`);
        expect(mockDisableUac).toBeCalledWith(invalid_uac);
        expect(response.status).toEqual(500);
        expect(response.body).toStrictEqual(`Disabling UAC: ${invalid_uac} failed`);

    });
});

describe("BusClientApi works and re-Enable functionality works correctly", () => {
    const request = supertest(NewServer(busApiClientMock, googleStorage, config, blaiseApiClient));

    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    it("should return a 200 status and re-Enable the uac code received in url", async () => {

        mockEnableUac.mockImplementation(() => {
            return Promise.resolve("Success");
        });

        const response = await request.get("/api/v1/enableUac/123456789123");
        expect(mockEnableUac).toBeCalledWith("123456789123");
        expect(response.status).toEqual(200);
        expect(response.body).toStrictEqual("Success");
    });

    it("should return a 500 status and error if uac is not valid", async () => {
        const invalid_uac = "123";
        mockEnableUac.mockImplementation(() => {
            return Promise.reject(`Enabling UAC: ${invalid_uac} failed`);
        });

        const response = await request.get(`/api/v1/enableUac/${invalid_uac}`);
        expect(mockEnableUac).toBeCalledWith(invalid_uac);
        expect(response.status).toEqual(500);
        expect(response.body).toStrictEqual(`Enabling UAC: ${invalid_uac} failed`);

    });
});

describe("BusClientApi works and fetches all disabled uac codes for questionnaire correctly", () => {
    const request = supertest(NewServer(busApiClientMock, googleStorage, config, blaiseApiClient));

    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    it("should return a 200 status and returns all disabled uac codes for questionnaire provided in url param", async () => {

        mockGetDisabledUacs.mockImplementation(() => {
            return Promise.resolve(disabledUacCodesForQuestionnaireMock);
        });

        const response = await request.get("/api/v1/getDiabledUacs/lms2209_em1");
        expect(mockGetDisabledUacs).toBeCalledWith("lms2209_em1");
        expect(response.status).toEqual(200);
        expect(response.body).toStrictEqual(disabledUacCodesForQuestionnaireMock);
    });

    it("should return a 200 status and empty list if there are no disabled uac codes for questionnaire sent as param", async () => {

        mockGetDisabledUacs.mockImplementation(() => {
            return Promise.resolve({});
        });

        const response = await request.get("/api/v1/getDiabledUacs/lms2209_em1");
        expect(mockGetDisabledUacs).toBeCalledWith("lms2209_em1");
        expect(response.status).toEqual(200);
        expect(response.body).toStrictEqual({});

    });
});