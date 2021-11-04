import {getMockReq, getMockRes} from "@jest-mock/express";
import { UacCodeGenerator} from "./generate-uacs-handler";
import {multerFileMock} from "../../mocks/file-mocks";

//mock bus api
import BusApiClient from "blaise-uac-service-node-client";
jest.mock("blaise-uac-service-node-client");
const mockGenerateUacCodes = jest.fn();
BusApiClient.prototype.generateUacCodes = mockGenerateUacCodes;
const busApiClientMock = new BusApiClient("bus-api-url", "bus-client-id");


//mock google storage
import {GoogleStorage} from "../storage/google-storage-functions";
jest.mock("../storage/google-storage-functions");
const mockUploadFileToBucket = jest.fn();
GoogleStorage.prototype.UploadFileToBucket = mockUploadFileToBucket;
const googleStorageMock = new GoogleStorage("a-project-name");

//mock csv parser
jest.mock("../utils/csv-parser");
import {getCaseIdsFromFile} from "../utils/csv-parser";
import { GetConfigFromEnv } from "../config";

const getCaseIdsFromFileMock = getCaseIdsFromFile as jest.Mock<Promise<string[]>>;

const {res, mockClear} = getMockRes();
const instrumentName = "DST1234A";
const caseIds = ["100000001", "100000002"];

const sampleFile = multerFileMock({
    filename: "sample.csv",
    path: "/temp/sample.csv",
    mimetype: "image/png",
    size: 50000,
});

describe("uac-generation-handler tests", () => {
    beforeEach(() => {
        mockClear();
        jest.clearAllMocks();
        jest.resetModules();
        mockGenerateUacCodes.mockReturnValue(Promise.resolve());
    });

    it("It should return a 400 if an filename is not provided", async () => {
        const req = getMockReq();
        req.file = sampleFile;
        const uacCodeGenerator = new UacCodeGenerator(busApiClientMock, googleStorageMock, GetConfigFromEnv());
        await uacCodeGenerator.ForSampleFile(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith("Filename not supplied");
    });

    it("It should return a 400 if an file is not provided", async () => {
        const req = getMockReq();
        req.body.fileName = `${instrumentName}.csv`;
        const uacCodeGenerator = new UacCodeGenerator(busApiClientMock, googleStorageMock, GetConfigFromEnv());
        await uacCodeGenerator.ForSampleFile(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith("File not supplied");
    });


    it("Upload file should be called with correct parameters with filename converted to lowercase if successful", async () => {
        setMocksForSuccess();
        await callGenerateUacCodesForSampleFileWithParameters();

        expect(mockUploadFileToBucket).toHaveBeenCalledWith("unique-bucket", sampleFile, `${instrumentName.toLowerCase()}.csv`);
    });

    it("It should return a 201 response with expected data if uac generation is successful", async () => {
        setMocksForSuccess();
        await callGenerateUacCodesForSampleFileWithParameters();

        expect(res.status).toHaveBeenCalledWith(201);
    });

    it("It should return a 500 response if the uac generation fails", async () => {
        mockGenerateUacCodes.mockImplementationOnce(() => {
            throw new Error();
        });

        await callGenerateUacCodesForSampleFileWithParameters();

        expect(res.status).toHaveBeenCalledWith(500);
    });

    it("It should return a 500 response if the file fails to parse", async () => {
        getCaseIdsFromFileMock.mockImplementationOnce(() => {
            throw new Error();
        });

        await callGenerateUacCodesForSampleFileWithParameters();

        expect(res.status).toHaveBeenCalledWith(500);
    });

    it("It should return a 500 response if the upload fails", async () => {
        mockUploadFileToBucket.mockImplementationOnce(() => {
            throw new Error();
        });

        await callGenerateUacCodesForSampleFileWithParameters();

        expect(res.status).toHaveBeenCalledWith(500);
    });

    afterEach(() => {
        mockClear();
        jest.clearAllMocks();
        jest.resetModules();
    });
});

async function callGenerateUacCodesForSampleFileWithParameters() {
    const req = getMockReq();
    req.params.instrumentName = instrumentName;
    req.body.fileName = `${instrumentName}.csv`;
    req.file = sampleFile;
    const uacCodeGenerator = new UacCodeGenerator(busApiClientMock, googleStorageMock, GetConfigFromEnv());
    await uacCodeGenerator.ForSampleFile(req, res);
}

function setMocksForSuccess() {
    getCaseIdsFromFileMock.mockImplementationOnce(() => Promise.resolve(caseIds));
}
