import server from "./../server";
import {fileExists} from "./file-exists-handler";
import {getMockReq, getMockRes} from "@jest-mock/express";
import {fileExistsInBucket} from "./../storage/google-storage-functions";
import supertest from "supertest";

jest.mock("./../storage/google-storage-functions");

//have to test the parameter separately as technically you cannot call the endpoint with a null or empty filename :/
describe("fileExists parameter tests", () => {
    const {res, mockClear} = getMockRes();

    beforeEach(() => {
        mockClear();
    });

    it("It should return a 400 status if a filename is not provided", async () => {

        const req = getMockReq({
            params: {"fileName": undefined}
        });

        await expect(fileExists(req, res));
        expect(res.status).toHaveBeenCalledWith(400);
    });
});

describe("file-exists-handler tests", () => {
    const request = supertest(server);

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
        fileExistsInBucketMock.mockReset();
    });

    const fileExistsInBucketMock = fileExistsInBucket as jest.Mock<Promise<boolean>>;
    const fileName = "DST2101A.csv";

    it("It should be called with correct parameters with filename converted to lowercase", async () => {
        fileExistsInBucketMock.mockImplementationOnce(() => {
            return Promise.resolve(true);
        });

        await request
            .get(`/api/v1/file/${fileName}/exists`)
            .expect(200);

        expect(fileExistsInBucketMock).toHaveBeenCalledWith("unique-bucket", fileName.toLowerCase());
    });

    it("It should return a 200 response with true if the file exists", async () => {
        fileExistsInBucketMock.mockImplementationOnce(() => {
            return Promise.resolve(true);
        });

        await request
            .get(`/api/v1/file/${fileName}/exists`)
            .expect(200, "true");
    });

    it("It should return a 200 response with false if the file does not exist", async () => {
        const req = getMockReq({
            params: {"fileName": "DST2012A.csv"}
        });

        fileExistsInBucketMock.mockImplementationOnce(() => {
            return Promise.resolve(false);
        });

        await request
            .get(`/api/v1/file/${fileName}/exists`)
            .expect(200, "false");
    });
});

