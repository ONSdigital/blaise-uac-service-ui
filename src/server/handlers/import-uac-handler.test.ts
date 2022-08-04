import { getMockReq, getMockRes } from "@jest-mock/express";
import { ImportUacHandler } from "./import-uac-handler";
import { GetConfigFromEnv } from "../config";
import { multerFileMock } from "../../mocks/file-mocks";
import { AxiosError, AxiosResponse } from "axios";

const config = GetConfigFromEnv();

//mock bus api
import BusApiClient from "blaise-uac-service-node-client";
jest.mock("blaise-uac-service-node-client");
const mockImportUacs = jest.fn();
BusApiClient.prototype.importUACs = mockImportUacs;
const busApiClientMock = new BusApiClient(config.BusApiUrl, config.BusClientId);

//mock csv parser
jest.mock("../utils/csv-parser");
import { getUacsFromFile } from "../utils/csv-parser";

const getUacsFromFileMock = getUacsFromFile as jest.Mock<Promise<string[]>>;

const { res, mockClear } = getMockRes();
const uacFile = multerFileMock({
    filename: "uacs.csv",
    path: "/temp/uacs.csv",
    mimetype: "text/csv",
    size: 50000,
});

describe("import uac tests", () => {
    beforeEach(() => {
        mockClear();
        jest.clearAllMocks();
        jest.resetModules();
        setMocksForSuccess();
    });

    it("return 200 and count of imported uacs when all goes well", async () => {
        const req = getMockReq();
        req.file = uacFile;

        const importUacHandler = new ImportUacHandler(busApiClientMock);

        await importUacHandler.ImportUacs(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ "uacs_imported": 2 });
    });

    it("returns a status 500 if uacs cannot be read from file", async () => {
        const req = getMockReq();
        req.file = uacFile;

        getUacsFromFileMock.mockImplementation(() => {
            throw new Error();
        });

        const importUacHandler = new ImportUacHandler(busApiClientMock);

        await importUacHandler.ImportUacs(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith("Could not import uacs, please try again");
    });

    it("returns a status 500 if uacs could not be imported", async() => {
        const req = getMockReq();
        req.file = uacFile;

        mockImportUacs.mockImplementation(() => {
            throw new Error();
        });

        const importUacHandler = new ImportUacHandler(busApiClientMock);

        await importUacHandler.ImportUacs(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith("Could not import uacs, please try again");
    });

    it("returns the status code and response body from import uac, if it can get them from an error", async () => {
        const req = getMockReq();
        req.file = uacFile;

        mockImportUacs.mockImplementation(() => {
            const error: AxiosError = <AxiosError>{};
            const response: AxiosResponse = <AxiosResponse>{};
            response.status = 400;
            response.data = { error: "Something went wrong" };
            error.response = response;
            throw error;
        });

        const importUacHandler = new ImportUacHandler(busApiClientMock);

        await importUacHandler.ImportUacs(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ "error": "Something went wrong" });
    });

    afterEach(() => {
        mockClear();
        jest.clearAllMocks();
        jest.resetModules();
    });
});

function setMocksForSuccess() {
    mockImportUacs.mockReturnValue(Promise.resolve({ uacs_imported: 2 }));
    getUacsFromFileMock.mockReturnValue(Promise.resolve(["123412341234", "432143214321"]));
}
