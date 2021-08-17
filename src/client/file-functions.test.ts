import {uploadFile, fileExists} from "./file-functions";
import {fileMock} from "./../mocks/FileMock";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";

// This sets the mock adapter on the default instance
const mock = new MockAdapter(axios, {onNoMatch: "throwException"});

const instrumentName = "DST2101A";

describe("Upload file tests", () => {
    const sampleFile = fileMock({
        name: "sample.csv",
        type: "image/png",
        size: 50000,
    });

    beforeAll(() => {
        jest.clearAllMocks();
        mock.reset();
    });

    it("It should return null if an instrument name is not provided", async () => {
        const result = await uploadFile(undefined, sampleFile);
        expect(result).toBeFalsy();
    });

    it("It should return null if a file is not provided", async () => {
        const result = await uploadFile(instrumentName, undefined);
        expect(result).toBeFalsy();
    });

    it("It should set the content-type correctly", async () => {
        mock.onPost("/api/v1/file/upload").reply(201);

        await uploadFile(instrumentName, sampleFile);
        expect(mock.history.post[0].headers["Content-Type"]).toBe("multipart/form-data");
    });

    it("It should pass the correct parameters", async () => {
        mock.onPost("/api/v1/file/upload").reply(201);

        await uploadFile(instrumentName, sampleFile);
        expect(mock.history.post[0].data.get("fileName")).toBe(`${instrumentName}.csv`);
        expect(mock.history.post[0].data.get("file")).toBe(sampleFile);
    });

    it("It should return true if file upload is successful", async () => {
        mock.onPost("/api/v1/file/upload").reply(201);

        const result = await uploadFile(instrumentName, sampleFile);
        expect(result).toBeTruthy();
    });

    it("It should return false if file upload is not successful", async () => {
        mock.onPost("/api/v1/file/upload").networkError();

        const result = await uploadFile(instrumentName, sampleFile);
        expect(result).toBeFalsy();
    });
});


describe("File exists tests", () => {
    beforeAll(() => {
        jest.clearAllMocks();
        mock.reset();
    });

    it("It should return null if an instrument name is not provided", async () => {
        const result = await fileExists(undefined);
        expect(result).toBeFalsy();
    });

    it("It should return true if a file already exists", async () => {
        const fileName = `${instrumentName}.csv`;
        mock.onGet(`/api/v1/file/${fileName}/exists`).reply(200, true);

        const result = await fileExists(instrumentName);
        expect(result).toBeTruthy();
    });

    it("It should return false if a file does not exist", async () => {
        const fileName = `${instrumentName}.csv`;
        mock.onGet(`/api/v1/file/${fileName}/exists`).reply(200, false);

        const result = await fileExists(instrumentName);
        expect(result).toBeFalsy();
    });
});
