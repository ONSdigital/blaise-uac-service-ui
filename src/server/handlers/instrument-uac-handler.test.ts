import {getMockReq, getMockRes} from "@jest-mock/express";
import { InstrumentUacHandler } from "./instrument-uac-handler";
import {multerFileMock} from "../../mocks/file-mocks";
import { GetConfigFromEnv } from "../config";
import { matchedInstrumentUacDetails, validSampleCsv, validSampleFileWithUacArrayResponse } from "../../mocks/csv-mocks";

const config = GetConfigFromEnv();

//mock bus api
import BusApiClient from "blaise-uac-service-node-client";
jest.mock("blaise-uac-service-node-client");
const mockGenerateUacCodes = jest.fn();
BusApiClient.prototype.generateUacCodes = mockGenerateUacCodes;
const mockGetUacCodesByCaseId = jest.fn();
BusApiClient.prototype.getUacCodesByCaseId = mockGetUacCodesByCaseId;
const busApiClientMock = new BusApiClient(config.BusApiUrl, config.BusClientId);


//mock google storage
import {GoogleStorage} from "../storage/google-storage-functions";
jest.mock("../storage/google-storage-functions");
const mockUploadFileToBucket = jest.fn();
GoogleStorage.prototype.UploadFileToBucket = mockUploadFileToBucket;
const getFileFromBucketMock = jest.fn();
GoogleStorage.prototype.GetFileFromBucket = getFileFromBucketMock;
const googleStorageMock = new GoogleStorage(config.ProjectID);

//mock csv parser
jest.mock("../utils/csv-parser");
import { getCaseIdsFromFile, addUacCodesToFile} from "../utils/csv-parser";
import {AxiosError, AxiosResponse} from "axios";

const getCaseIdsFromFileMock = getCaseIdsFromFile as jest.Mock<Promise<string[]>>;
const addUacCodesToFileMock = addUacCodesToFile as jest.Mock<Promise<string[]>>;

const {res, mockClear} = getMockRes();
const instrumentName = "DST1234A";
const filename = `${instrumentName}.csv`;
const fileData = Buffer.from(validSampleCsv);
const caseIds = ["100000001", "100000002"];

const sampleFile = multerFileMock({
    filename: "sample.csv",
    path: "/temp/sample.csv",
    mimetype: "image/png",
    size: 50000,
});

describe("generate uac from sample tests", () => {
    beforeEach(() => {
        mockClear();
        jest.clearAllMocks();
        jest.resetModules();
        setMocksForSuccess();
    });

    it("It should return a 400 if an filename is not provided", async () => {
        const req = getMockReq();
        req.file = sampleFile;
        const instrumentUacHandler = new InstrumentUacHandler(busApiClientMock, googleStorageMock, config);
        await instrumentUacHandler.GenerateUacsForSampleFile(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith("Filename not supplied");
    });

    it("It should return a 400 if an file is not provided", async () => {
        const req = getMockReq();
        req.body.fileName = `${instrumentName}.csv`;
        const instrumentUacHandler = new InstrumentUacHandler(busApiClientMock, googleStorageMock, config);
        await instrumentUacHandler.GenerateUacsForSampleFile(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith("File not supplied");
    });


    it("Upload file should be called with correct parameters with filename converted to lowercase if successful", async () => {
        await callGenerateUacCodesForSampleFileWithParameters();

        expect(mockUploadFileToBucket).toHaveBeenCalledWith("unique-bucket", sampleFile, `${instrumentName.toLowerCase()}.csv`);
    });

    it("It should return a 201 response with expected data if uac generation is successful", async () => {
        await callGenerateUacCodesForSampleFileWithParameters();

        expect(res.status).toHaveBeenCalledWith(201);
    });

    it("It should return a 500 response if the uac generation fails", async () => {
        mockGenerateUacCodes.mockImplementation(() => {
            throw new Error("Cannot generate uac codes");
        });

        await callGenerateUacCodesForSampleFileWithParameters();

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({error: "Cannot generate uac codes"});
    });

    it("It should return a 500 response if the file fails to parse", async () => {
        getCaseIdsFromFileMock.mockImplementation(() => {
        const error: AxiosError = <AxiosError>{};
        const response: AxiosResponse = <AxiosResponse>{};
        response.status = 400;
        response.data = {error: "Something went wrong getting case ids"};
        error.response = response;
        throw error;
    });

        await callGenerateUacCodesForSampleFileWithParameters();

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({error: "Something went wrong getting case ids"});
    });

    it("It should return a 500 response if the upload fails", async () => {
        mockGenerateUacCodes.mockReturnValue(true);
        mockUploadFileToBucket.mockImplementation(() => {
          const error: AxiosError = <AxiosError>{};
          const response: AxiosResponse = <AxiosResponse>{};
          response.status = 400;
          response.data = "Something went wrong uploading file to bucket";
          error.response = response;
          throw error;
        });

        await callGenerateUacCodesForSampleFileWithParameters();

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({error: "Something went wrong uploading file to bucket"});
    });

    afterEach(() => {
        mockClear();
        jest.clearAllMocks();
        jest.resetModules();
    });
});

describe("get uacs for sample file tests", () => {
    beforeEach(() => {
        mockClear();
        jest.clearAllMocks();
        jest.resetModules();
        setMocksForSuccess();
    });

    it("Get file should be called with correct parameters with filename converted to lowercase if successful", async () => {
        await callGetSampleFileWithParameters();

        expect(getFileFromBucketMock).toHaveBeenCalledWith(config.BucketName, `${filename.toLowerCase()}`);
    });

    it("Add UAC codes to file should be called with correct parameters if successful", async () => {
        await callGetSampleFileWithParameters();

        expect(addUacCodesToFileMock).toHaveBeenCalledWith(fileData, matchedInstrumentUacDetails);
    });

    it("It should return a 200 response with expected data if uac generation is successful", async () => {
        await callGetSampleFileWithParameters();

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(validSampleFileWithUacArrayResponse);
    });

    it("It should return a 400 bad request response if the file is not parsed correctly", async () => {
        getFileFromBucketMock.mockReturnValue(Promise.resolve(fileData));

        mockGetUacCodesByCaseId.mockReturnValue(Promise.resolve(matchedInstrumentUacDetails));

        addUacCodesToFileMock.mockReturnValue(Promise.resolve([]));

        await callGetSampleFileWithParameters();

        expect(res.status).toHaveBeenCalledWith(400);
    });

    it("It should return a 500 response if getting the file from the bucket fails", async () => {
        getFileFromBucketMock.mockImplementation(() => {
            throw new Error();
        });

        await callGetSampleFileWithParameters();

        expect(res.status).toHaveBeenCalledWith(500);
    });

    it("It should return a 500 response if getting the uac details from the bus api client fails", async () => {
        getFileFromBucketMock.mockReturnValue(Promise.resolve(fileData));

        mockGetUacCodesByCaseId.mockImplementation(() => {
            throw new Error();
        });

        await callGetSampleFileWithParameters();

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
    const instrumentUacHandler = new InstrumentUacHandler(busApiClientMock, googleStorageMock, config);
    await instrumentUacHandler.GenerateUacsForSampleFile(req, res);
}

async function callGetSampleFileWithParameters() {
    const req = getMockReq();
    req.params.instrumentName = instrumentName;
    req.params.fileName = filename;
    const instrumentUacHandler = new InstrumentUacHandler(busApiClientMock, googleStorageMock, config);
    await instrumentUacHandler.GetSampleFileWithUacs(req, res);
}

function setMocksForSuccess() {
    getFileFromBucketMock.mockReturnValue(Promise.resolve(fileData));

    mockGetUacCodesByCaseId.mockReturnValue(Promise.resolve(matchedInstrumentUacDetails));

    addUacCodesToFileMock.mockReturnValue(Promise.resolve(validSampleFileWithUacArrayResponse));

    getCaseIdsFromFileMock.mockReturnValue(Promise.resolve(caseIds));
}
