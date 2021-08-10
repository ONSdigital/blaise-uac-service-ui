import {uploadFile} from "./storage";
import {getMockReq, getMockRes} from "@jest-mock/express";

import {multerFileMock} from "./../../mocks/FileMock";

jest.mock("./google-storage-functions");
import {uploadFileToBucket} from "./google-storage-functions";

const {res, mockClear} = getMockRes();

const sampleFile = multerFileMock({
    filename: "sample.csv",
    path: "/temp/sample.csv",
    mimetype: "image/png",
    size: 50000,
});

const uploadFileToBucketMock = uploadFileToBucket as jest.Mock<Promise<void>>;

describe("uploadFile should return 400 bad request if instrument name or file is not provided", () => {
    beforeEach(() => {
        mockClear();
    });

    it("It should return 404 if an instrument name is not provided", async () => {

        const req = getMockReq({
            body: {},
            file: sampleFile
        });


        await uploadFile(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith("Instrument name not supplied");
    });

    it("It should return 404 if a file is not provided", async () => {

        const req = getMockReq({
            body: { "instrumentName": "DST2012A"}
        });

        await uploadFile(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith("File not supplied");
    });
});

describe("uploadFile passes expected parameters and returns 200 response if upload is successful", () => {
    beforeEach(() => {
        mockClear();
        uploadFileToBucketMock.mockImplementationOnce(() => {return Promise.resolve();});
    });

    it("It should be called with correct parameters", async () => {
        const req = getMockReq({
            body: { "instrumentName": "DST2012A"},
            file: sampleFile
        });

        await uploadFile(req, res);
        expect(uploadFileToBucketMock).toHaveBeenCalledWith("unique-bucket", "/temp/sample.csv", "DST2012A.csv");
    });

    it("It should return a 200 response if upload is successful", async () => {
        const req = getMockReq({
            body: { "instrumentName": "DST2012A"},
            file: sampleFile
        });

        await uploadFile(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
    });
});

describe("uploadFile returns 500 response if upload is not successful", () => {
    beforeEach(() => {
        mockClear();
        uploadFileToBucketMock.mockImplementationOnce(() => {return Promise.reject();});
    });

    it("It should return a 200 response if upload is successful", async () => {
        const req = getMockReq({
            body: { "instrumentName": "DST2012A"},
            file: sampleFile
        });

        await uploadFile(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
    });
});
