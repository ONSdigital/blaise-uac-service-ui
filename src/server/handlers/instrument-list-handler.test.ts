import express from "express";
import supertest from "supertest";
import InstrumentListHandler from "./instrument-list-handler";

//mock google storage
import { GoogleStorage } from "../storage/google-storage-functions";
jest.mock("../storage/google-storage-functions");
const getFilenamesInBucketMock = jest.fn();
GoogleStorage.prototype.GetFileNamesInBucket = getFilenamesInBucketMock;
const googleStorageMock = new GoogleStorage("a-project-name");

describe("instrument-list-handler tests", () => {
    const server = express();
    server.use("/", InstrumentListHandler(googleStorageMock, "unique-bucket"));
    const request = supertest(server);
    const url = "/api/v1/instruments";

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    it("It should be called with correct parameters with filename converted to lowercase", async () => {
        getFilenamesInBucketMock.mockImplementationOnce(() => {
            return Promise.resolve([]);
        });

        await request
            .get(url)
            .expect(200);

        expect(getFilenamesInBucketMock).toHaveBeenCalledWith("unique-bucket");
    });

    it("It should return a 200 response with list of expected instruments in uppercase", async () => {

        getFilenamesInBucketMock.mockImplementationOnce(() => {
            const fileNames = ["dst1234a.csv", "DST5432A.csv"];
            return Promise.resolve(fileNames);
        });

        await request
            .get(url)
            .expect(200, ["DST1234A", "DST5432A"]);
    });

    it("It should filter out any non CSV files", async () => {

        getFilenamesInBucketMock.mockImplementationOnce(() => {
            const fileNames = ["dst1234a.csv", "randomFile.bak", "DST5432A.csv"];
            return Promise.resolve(fileNames);
        });

        await request
            .get(url)
            .expect(200, ["DST1234A", "DST5432A"]);
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });
});
