import server from "./../server";
import {getFileNamesInBucket} from "./../storage/google-storage-functions";
import supertest from "supertest";

jest.mock("./../storage/google-storage-functions");

describe("instrument-list-handler tests", () => {
    const request = supertest(server);
    const url = "/api/v1/instruments";

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
        getFilenamesInBucketMock.mockReset();
    });

    const getFilenamesInBucketMock = getFileNamesInBucket as jest.Mock<Promise<string[]>>;
    const fileName = "DST2101A.csv";

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
});

