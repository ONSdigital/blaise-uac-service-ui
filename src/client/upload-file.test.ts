import {uploadFile} from "./upload-file";
import {fileMock} from "./../mocks/FileMock";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";

// This sets the mock adapter on the default instance
const mock = new MockAdapter(axios, {onNoMatch: "throwException"});


const instrumentName = "DST2101A";
const sampleFile = fileMock({
    name: "sample.csv",
    type: "image/png",
    size: 50000,
});

describe("Function will return false if arguments are not provided", () => {

    it("It should return null if an instrument name is not provided", async () => {
        const result = await uploadFile(undefined, sampleFile);
        expect(result).toBeFalsy();
    });

    it("It should return null if a file is not provided", async () => {
        const result = await uploadFile(instrumentName, undefined);
        expect(result).toBeFalsy();
    });
});

describe("Function will set multipart/form-data content-type", () => {
    beforeAll(() => {
        mock.onPost("/api/v1/upload").reply(201);
    });

    it("It should set the content-type correctly", async () => {
        await uploadFile(instrumentName, sampleFile);
        expect(mock.history.post[0].headers["Content-Type"]).toBe("multipart/form-data");
    });

    afterAll(async () => {
        mock.reset();
    });
});

describe("Function will return true if file is uploaded", () => {
    beforeAll(() => {
        mock.onPost("/api/v1/upload").reply(201);
    });

    it("It should return true if file upload is successful", async () => {
        const result = await uploadFile(instrumentName, sampleFile);
        expect(result).toBeTruthy();
    });

    afterAll(async () => {
        mock.reset();
    });
});

describe("Function will return false if file fails to upload", () => {
    beforeAll(() => {
        mock.onPost("/api/v1/upload").networkError();
    });

    it("It should return false if file upload is not successful", async () => {
        const result = await uploadFile(instrumentName, sampleFile);
        expect(result).toBeFalsy();
    });

    afterAll(async () => {
        mock.reset();
    });
});
