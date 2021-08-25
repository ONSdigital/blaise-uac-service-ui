import {getMockReq, getMockRes} from "@jest-mock/express";
import {GenerateUacCodesForSampleFile} from "./generate-uacs-handler";
import {multerFileMock} from "../../mocks/file-mocks";

//mock bus api
jest.mock("../api-clients/BusApi/bus-api-client");
import BusApiClient from "../api-clients/BusApi/bus-api-client";
const busApiClientMock = BusApiClient as jest.Mock;

//mock google storage
jest.mock("../storage/google-storage-functions");
import {uploadFileToBucket} from "../storage/google-storage-functions";
const uploadFileToBucketMock = uploadFileToBucket as jest.Mock<Promise<void>>;

//mock csv parser
jest.mock("../utils/csv-parser");
import {getCaseIdsFromFile, addUacCodesToFile} from "../utils/csv-parser";
import {matchedInstrumentUacDetails, validSampleFileWithUacArrayResponse} from "../../mocks/csv-mocks";

const getCaseIdsFromFileMock = getCaseIdsFromFile as jest.Mock<Promise<string[]>>;
const addUacCodesToFileMock = addUacCodesToFile as jest.Mock<Promise<string[]>>;

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
    });

    it("It should return a 400 if an filename is not provided", async () => {
        const req = getMockReq();
        req.file = sampleFile;
        await GenerateUacCodesForSampleFile(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith("Filename not supplied");
    });

    it("It should return a 400 if an file is not provided", async () => {
        const req = getMockReq();
        req.body.fileName = `${instrumentName}.csv`;
        await GenerateUacCodesForSampleFile(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith("File not supplied");
    });

    it("Bus api client should be called with correct parameter", async () => {
        await callGenerateUacCodesForSampleFileWithParameters();

        expect(busApiClientMock).toHaveBeenCalledWith("bus-api-url", "bus-client-id");
    });

    it("Generate UACS should be called with correct parameters if successful", async () => {
        setMocksForSuccess();
        await callGenerateUacCodesForSampleFileWithParameters();

        expect(getCaseIdsFromFileMock).toHaveBeenCalledWith(sampleFile.buffer);

        expect(busApiClientMock).toHaveBeenCalledWith("bus-api-url", "bus-client-id");
    });

    it("Upload file should be called with correct parameters with filename converted to lowercase if successful", async () => {
        setMocksForSuccess();
        await callGenerateUacCodesForSampleFileWithParameters();

        expect(uploadFileToBucketMock).toHaveBeenCalledWith("unique-bucket", sampleFile, `${instrumentName.toLowerCase()}.csv`);
    });

    it("Add UAC codes to file should be called with correct parameters if successful", async () => {
        setMocksForSuccess();
        await callGenerateUacCodesForSampleFileWithParameters();

        expect(addUacCodesToFileMock).toHaveBeenCalledWith(sampleFile.buffer, matchedInstrumentUacDetails);
    });

    it("It should return a 200 response with expected data if uac generation is successful", async () => {
        setMocksForSuccess();
        await callGenerateUacCodesForSampleFileWithParameters();

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(validSampleFileWithUacArrayResponse);
    });

    it("It should return a 500 response if the uac generation fails", async () => {
        busApiClientMock.mockImplementationOnce(() => {
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
        uploadFileToBucketMock.mockImplementationOnce(() => {
            throw new Error();
        });

        await callGenerateUacCodesForSampleFileWithParameters();

        expect(res.status).toHaveBeenCalledWith(500);
    });
});

async function callGenerateUacCodesForSampleFileWithParameters() {
    const req = getMockReq();
    req.params.instrumentName = instrumentName;
    req.body.fileName = `${instrumentName}.csv`;
    req.file = sampleFile;
    await GenerateUacCodesForSampleFile(req, res);
}

function setMocksForSuccess() {
    getCaseIdsFromFileMock.mockImplementationOnce(() => Promise.resolve(caseIds));

    busApiClientMock.mockImplementation(() => {
        return {
            generateUacCodes: () => {
                return Promise.resolve(matchedInstrumentUacDetails);
            },
        };
    });

    addUacCodesToFileMock.mockImplementationOnce(() => Promise.resolve(validSampleFileWithUacArrayResponse));
}


