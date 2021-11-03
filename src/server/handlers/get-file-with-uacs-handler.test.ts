import {getMockReq, getMockRes} from "@jest-mock/express";

//mock bus api
import BusApiClient from "blaise-uac-service-node-client";
jest.mock("blaise-uac-service-node-client");
const mockGetUacCodesByCaseId = jest.fn();
BusApiClient.prototype.getUacCodesByCaseId = mockGetUacCodesByCaseId;
const busApiClientMock = new BusApiClient("bus-api-url", "bus-client-id");

//mock google storage
jest.mock("../storage/google-storage-functions");
import {getFileFromBucket} from "../storage/google-storage-functions";

const getFileFromBucketMock = getFileFromBucket as jest.Mock<Promise<Buffer>>;

//mock csv parser
jest.mock("../utils/csv-parser");
import {addUacCodesToFile} from "../utils/csv-parser";

const addUacCodesToFileMock = addUacCodesToFile as jest.Mock<Promise<string[]>>;

import {matchedInstrumentUacDetails, validSampleCsv, validSampleFileWithUacArrayResponse} from "../../mocks/csv-mocks";
import {SampleFileHandler} from "./get-file-with-uacs-handler";


const {res, mockClear} = getMockRes();
const instrumentName = "DST1234A";
const filename = `${instrumentName}.csv`;
const fileData = Buffer.from(validSampleCsv);

describe("get-uac-handler tests", () => {
    beforeEach(() => {
        mockClear();
        jest.clearAllMocks();
        jest.resetModules();
    });

    it("Get file should be called with correct parameters with filename converted to lowercase if successful", async () => {
        setMocksForSuccess();
        await callGetSampleFileWithParameters();

        expect(getFileFromBucketMock).toHaveBeenCalledWith("unique-bucket", `${filename.toLowerCase()}`);
    });

    it("Add UAC codes to file should be called with correct parameters if successful", async () => {
        setMocksForSuccess();
        await callGetSampleFileWithParameters();

        expect(addUacCodesToFileMock).toHaveBeenCalledWith(fileData, matchedInstrumentUacDetails);
    });

    it("It should return a 200 response with expected data if uac generation is successful", async () => {
        setMocksForSuccess();
        await callGetSampleFileWithParameters();

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(validSampleFileWithUacArrayResponse);
    });

    it("It should return a 400 bad request response if the file is not parsed correctly", async () => {
        getFileFromBucketMock.mockImplementationOnce(() => Promise.resolve(fileData));

        mockGetUacCodesByCaseId.mockReturnValue(Promise.resolve(matchedInstrumentUacDetails));

        addUacCodesToFileMock.mockImplementationOnce(() => Promise.resolve([]));

        await callGetSampleFileWithParameters();

        expect(res.status).toHaveBeenCalledWith(400);
    });

    it("It should return a 500 response if getting the file from the bucket fails", async () => {
        getFileFromBucketMock.mockImplementationOnce(() => {
            throw new Error();
        });

        await callGetSampleFileWithParameters();

        expect(res.status).toHaveBeenCalledWith(500);
    });

    it("It should return a 500 response if getting the uac details from the bus api client fails", async () => {
        getFileFromBucketMock.mockImplementationOnce(() => Promise.resolve(fileData));

        getFileFromBucketMock.mockImplementationOnce(() => {
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

async function callGetSampleFileWithParameters() {
    const req = getMockReq();
    req.params.instrumentName = instrumentName;
    req.params.fileName = filename;
    const sampleFileHandler = new SampleFileHandler(busApiClientMock, "unique-bucket");
    await sampleFileHandler.GetSampleFileWithUacs(req, res);
}

function setMocksForSuccess() {
    getFileFromBucketMock.mockImplementationOnce(() => Promise.resolve(fileData));

    mockGetUacCodesByCaseId.mockReturnValue(Promise.resolve(matchedInstrumentUacDetails));

    addUacCodesToFileMock.mockImplementationOnce(() => Promise.resolve(validSampleFileWithUacArrayResponse));
}
