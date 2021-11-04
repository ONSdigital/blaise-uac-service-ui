import express from "express";
import { FileHandler } from "./file-exists-handler";
import FileExistsHandler from "./file-exists-handler";
import {getMockReq, getMockRes} from "@jest-mock/express";
import supertest from "supertest";

//mock google storage
jest.mock("../storage/google-storage-functions");
import { GoogleStorage } from "../storage/google-storage-functions";
const fileExistsInBucketMock = jest.fn();
GoogleStorage.prototype.FileExistsInBucket = fileExistsInBucketMock;
const googleStorageMock = new GoogleStorage("a-project-name");

const fileName = "DST2101A.csv";

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

        const fileHandler = new FileHandler(googleStorageMock, "unique-bucket");
        await fileHandler.FileExists(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
    });
});

describe("file-exists-handler tests", () => {
    const server = express();
    server.use("/", FileExistsHandler(googleStorageMock, "unique-bucket"));
    const request = supertest(server);

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    it("It should be called with correct parameters with filename converted to lowercase", async () => {
        fileExistsInBucketMock.mockReturnValueOnce(Promise.resolve(true));

        await request
            .get(`/api/v1/file/${fileName}/exists`)
            .expect(200);

        expect(fileExistsInBucketMock).toHaveBeenCalledWith("unique-bucket", fileName.toLowerCase());
    });

    it("It should return a 200 response with true if the file exists", async () => {
        fileExistsInBucketMock.mockReturnValueOnce(Promise.resolve(true));

        await request
            .get(`/api/v1/file/${fileName}/exists`)
            .expect(200, "true");
    });

    it("It should return a 200 response with false if the file does not exist", async () => {
        fileExistsInBucketMock.mockReturnValueOnce(Promise.resolve(false));

        await request
            .get(`/api/v1/file/${fileName}/exists`)
            .expect(200, "false");
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });
});
