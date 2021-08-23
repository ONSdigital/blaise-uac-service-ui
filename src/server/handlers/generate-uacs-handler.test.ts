import {getMockReq, getMockRes} from "@jest-mock/express";
import {GenerateUacCodesForSampleFile} from "./generate-uacs-handler";
import {multerFileMock} from "../../mocks/file-mocks";

//mock bus api
jest.mock("../api-clients/BusApi/bus-api-client");
import BusApiClient from "../api-clients/BusApi/bus-api-client";
const BusApiClientMock = BusApiClient as jest.Mock;

//mock google storage
jest.mock("./../storage/google-storage-functions");
import {uploadFileToBucket} from "./../storage/google-storage-functions";
const uploadFileToBucketMock = uploadFileToBucket as jest.Mock<Promise<void>>;

//mock csv parser
jest.mock("../utils/csv-parser");
import {getCaseIdsFromFile} from "../utils/csv-parser";
const getCaseIdsFromFileMock = getCaseIdsFromFile as jest.Mock<Promise<string[]>>;

const {res, mockClear} = getMockRes();
const instrumentName = "DST1234A";

const sampleFile = multerFileMock({
    filename: "sample.csv",
    path: "/temp/sample.csv",
    mimetype: "image/png",
    size: 50000,
});

describe("uac-generation-handler tests", () => {
    beforeEach(() => {
        mockClear();
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

    it("Bus api client should be called with correct parameters with filename converted to lowercase", async () => {
        await callGenerateUacCodesForSampleFileWithParameters();

        expect(res.status).toHaveBeenCalledWith(201);
        expect(BusApiClientMock).toHaveBeenCalledWith("bus-api-url", "bus-client-id");
    });

    it("Upload file should be called with correct parameters with filename converted to lowercase", async () => {
        await callGenerateUacCodesForSampleFileWithParameters();

        expect(res.status).toHaveBeenCalledWith(201);
        expect(getCaseIdsFromFileMock).toHaveBeenCalledWith(sampleFile.buffer);
        expect(uploadFileToBucketMock).toHaveBeenCalledWith("unique-bucket", sampleFile, `${instrumentName.toLowerCase()}.csv`);
    });

    it("It should return a 201 response if uac generation is successful", async () => {
        await callGenerateUacCodesForSampleFileWithParameters();

        expect(res.status).toHaveBeenCalledWith(201);
    });

    it("It should return a 500 response if the uac generation fails", async () => {
        BusApiClientMock.mockImplementationOnce(() => {
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
    req.body.fileName = `${instrumentName}.csv`;
    req.file = sampleFile;
    await GenerateUacCodesForSampleFile(req, res);
}



