import server from "./../server";
import {getMockReq, getMockRes} from "@jest-mock/express";

import {fileMock, multerFileMock} from "./../../mocks/FileMock";

jest.mock("./../storage/google-storage-functions");
import {uploadFileToBucket} from "./../storage/google-storage-functions";
import supertest from "supertest";

const {res, mockClear} = getMockRes();

const request = supertest(server);

describe("file-upload-handler tests", () => {
    beforeEach(() => {
        mockClear();
    });

    const sampleFile = multerFileMock({
        filename: "sample.csv",
        path: "/temp/sample.csv",
        mimetype: "image/png",
        size: 50000,
    });

    const uploadFileToBucketMock = uploadFileToBucket as jest.Mock<Promise<void>>;

    it("It should reject if an instrument name is not provided", async () => {

        const instrumentName = "DST1234A";
        const sampleFile = fileMock({
            name: "sample.csv",
            type: "image/png",
            size: 50000,
        });

        const data = new FormData();
        data.append("instrumentName", instrumentName);
        data.append("file", sampleFile);

        await request
            .post("/api/v1/upload")
            .set({"Content-Type": "multipart/form-data"})
            .send(data)
            .expect(201);

    });

    it("It should reject if a file is not provided", async () => {

        const req = getMockReq({
            body: {"instrumentName": "DST2012A"}
        });

        //await expect(fileFunctions(req, res)).rejects.toEqual("File not supplied");
    });

    it("It should be called with correct parameters with filename converted to lowercase", async () => {
        const req = getMockReq({
            body: {"instrumentName": "DST2012A"},
            file: sampleFile
        });

        uploadFileToBucketMock.mockImplementationOnce(() => {
            return Promise.resolve();
        });

        //await fileFunctions(req, res);
        expect(uploadFileToBucketMock).toHaveBeenCalledWith("unique-bucket", "/temp/sample.csv", "dst2012a.csv");
    });

    it("It should return a 201 response if upload is successful", async () => {
        const req = getMockReq({
            body: {"instrumentName": "DST2012A"},
            file: sampleFile
        });

        uploadFileToBucketMock.mockImplementationOnce(() => {
            return Promise.resolve();
        });

        //await fileFunctions(req, res);
        expect(res.status).toHaveBeenCalledWith(201);
    });

    it("It should reject if the upload fails", async () => {
        const req = getMockReq({
            body: {"instrumentName": "DST2012A"},
            file: sampleFile
        });

        uploadFileToBucketMock.mockImplementationOnce(() => {
            return Promise.reject();
        });

        //await expect(fileFunctions(req, res)).rejects.toEqual("Upload file failed");
    });
});



