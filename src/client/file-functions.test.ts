/**
 * @jest-environment jsdom
 */

import {
    generateUacCodesForSampleFile,
    sampleFileAlreadyExists,
    getSampleFileWithUacCodes,
    getListOfInstrumentsWhichHaveExistingSampleFiles,
    importUacsFromFile
} from "./file-functions";
import { fileMock } from "../mocks/file-mocks";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import { validSampleFileWithUacDatasResponse } from "../mocks/csv-mocks";
import { instrumentNames } from "../mocks/api-mocks";

// This sets the mock adapter on the default instance
const mock = new MockAdapter(axios, { onNoMatch: "throwException" });

const instrumentName = "DST2101A";
const fileName = "DST2101A.csv";

describe("generateUacCodesForFile file tests", () => {
    const sampleFile = fileMock({
        name: "sample.csv",
        type: "image/png",
        size: 50000,
    });

    beforeAll(() => {
        jest.clearAllMocks();
        mock.reset();
    });

    it("It should return error if an instrument name is not provided", async () => {
        await expect(generateUacCodesForSampleFile(undefined, sampleFile))
            .rejects
            .toThrow("Questionnaire name was not supplied");
    });

    it("It should return error if a file is not provided", async () => {
        await expect(generateUacCodesForSampleFile(instrumentName, undefined))
            .rejects
            .toThrow("file was not supplied");
    });

    it("It should set the content-type correctly", async () => {
        mock.onPost(`/api/v1/instrument/${instrumentName}/uac/sample`).reply(201);

        await generateUacCodesForSampleFile(instrumentName, sampleFile);
        expect(mock.history.post[0].headers["Content-Type"]).toBe("application/x-www-form-urlencoded");
    });

    it("It should pass the correct parameters", async () => {
        mock.onPost(`/api/v1/instrument/${instrumentName}/uac/sample`).reply(201);

        await generateUacCodesForSampleFile(instrumentName, sampleFile);
        expect(mock.history.post[0].data.get("fileName")).toBe(`${instrumentName}.csv`);
        expect(mock.history.post[0].data.get("file")).toBe(sampleFile);
    });

    it("It should return true if UAC generation is successful", async () => {
        mock.onPost(`/api/v1/instrument/${instrumentName}/uac/sample`).reply(201);

        const result = await generateUacCodesForSampleFile(instrumentName, sampleFile);
        expect(result).toStrictEqual(true);
    });

    it("It should return the error if the UAC generation is not successful", async () => {
        mock.onPost(`/api/v1/instrument/${instrumentName}/uac/sample`).networkError();

        await expect(generateUacCodesForSampleFile(instrumentName, sampleFile)).rejects.toThrow("Network Error");
    });
});

describe("getSampleFileWithUacCodes file tests", () => {
    beforeAll(() => {
        jest.clearAllMocks();
        mock.reset();
    });

    it("It should return null if an instrument name is not provided", async () => {
        await expect(getSampleFileWithUacCodes(undefined, fileName))
            .rejects
            .toThrow("Questionnaire name was not supplied");
    });

    it("It should return null if a file is not provided", async () => {
        await expect(getSampleFileWithUacCodes(instrumentName, undefined))
            .rejects
            .toThrow("file name was not supplied");
    });

    it("It should return expected data if successful", async () => {
        mock.onGet(`/api/v1/instrument/${instrumentName}/uac/sample/${fileName}`).reply(200, validSampleFileWithUacDatasResponse);

        const result = await getSampleFileWithUacCodes(instrumentName, fileName);
        expect(result).toStrictEqual(validSampleFileWithUacDatasResponse);
    });

    it("It should fail with response code 400 if call is a bad request", async () => {
        mock.onGet(`/api/v1/instrument/${instrumentName}/uac/sample/${fileName}`).reply(400, null);

        await expect(getSampleFileWithUacCodes(instrumentName, fileName))
            .rejects
            .toThrow("Request failed with status code 400");
    });
});

describe("sampleFileAlreadyExists tests", () => {
    beforeAll(() => {
        jest.clearAllMocks();
        mock.reset();
    });

    it("It should return an error if an instrument name is not provided", async () => {
        await expect(sampleFileAlreadyExists(undefined))
            .rejects
            .toThrow("Questionnaire name was not supplied");
    });

    it("It should return true if a file already exists", async () => {
        mock.onGet(`/api/v1/file/${fileName}/exists`).reply(200, true);

        const result = await sampleFileAlreadyExists(instrumentName);
        expect(result).toBeTruthy();
    });

    it("It should return false if a file does not exist", async () => {
        mock.onGet(`/api/v1/file/${fileName}/exists`).reply(200, false);

        const result = await sampleFileAlreadyExists(instrumentName);
        expect(result).toBeFalsy();
    });

    it("It should return false if we cannot determine if a file exists", async () => {
        mock.onGet(`/api/v1/file/${fileName}/exists`).networkError();

        const result = await sampleFileAlreadyExists(instrumentName);
        expect(result).toBeFalsy();
    });
});

describe("getListOfInstrumentsWhichHaveExistingSampleFiles tests", () => {
    beforeAll(() => {
        jest.clearAllMocks();
        mock.reset();
    });

    it("It should return a list of existing sample files", async () => {
        mock.onGet("/api/v1/instruments").reply(200, instrumentNames);

        const result = await getListOfInstrumentsWhichHaveExistingSampleFiles();
        expect(result).toStrictEqual(instrumentNames);
    });
});

describe("importUacsFromFile", () => {
    const sampleFile = fileMock({
        name: "sample.csv",
        type: "image/png",
        size: 50000,
    });

    beforeAll(() => {
        jest.clearAllMocks();
        mock.reset();
    });

    it("It should return the number of uacs imported", async () => {
        mock.onPost("/api/v1/uac/import").reply(200, { uacs_imported: 12 });

        const result = await importUacsFromFile(sampleFile);
        expect(result).toStrictEqual(12);
    });

    it("It should throw an error if importing is a problem", async () => {
        mock.onPost("/api/v1/uac/import").reply(500, { error: "Something went wrong" });

        await expect(importUacsFromFile(sampleFile)).rejects.toThrow();
    });
});
