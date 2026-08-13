import axios from "axios";
import MockAdapter from "axios-mock-adapter";

import { mockQuestionnaireNames } from "../test-utils/api.mock";
import { mockValidSampleFileWithUacDatasResponse } from "../test-utils/csv.mock";
import { mockFile } from "../test-utils/file.mock";

import {
  disableUac,
  enableUac,
  generateUacsForSampleFile,
  getFileName,
  getListOfQuestionnairesWithExistingSampleFiles,
  getSampleFileWithUacs,
  importUacsFromFile,
  sampleFileAlreadyExists,
} from "./fileFunctions";

const mock = new MockAdapter(axios, { onNoMatch: "throwException" });

const questionnaireName = "DST2101A";
const fileName = "DST2101A.csv";

describe("generateUacsForFile file tests", () => {
  const sampleFile = mockFile({
    name: "sample.csv",
    type: "image/png",
    size: 50000,
  });

  beforeAll(() => {
    vi.clearAllMocks();
    mock.reset();
  });

  it("It should return error if a questionnaire name is not provided", async () => {
    await expect(generateUacsForSampleFile(undefined, sampleFile)).rejects.toThrow(
      "Questionnaire name was not supplied",
    );
  });

  it("It should return error if a file is not provided", async () => {
    await expect(generateUacsForSampleFile(questionnaireName, undefined)).rejects.toThrow(
      "file was not supplied",
    );
  });

  it("It should set the content-type correctly", async () => {
    mock.onPost(`/api/v1/questionnaire/${questionnaireName}/uac/sample`).reply(201);

    await generateUacsForSampleFile(questionnaireName, sampleFile);
    expect(mock.history.post[0]!.headers?.["Content-Type"]).toBe(
      "application/x-www-form-urlencoded",
    );
  });

  it("It should pass the correct parameters", async () => {
    mock.onPost(`/api/v1/questionnaire/${questionnaireName}/uac/sample`).reply(201);

    await generateUacsForSampleFile(questionnaireName, sampleFile);
    expect(mock.history.post[0].data.get("fileName")).toBe(`${questionnaireName}.csv`);
    expect(mock.history.post[0].data.get("file")).toBe(sampleFile);
    expect(mock.history.post[0].data.get("overwrite")).toBe("false");
  });

  it("It should pass overwrite when the caller allows replacement", async () => {
    mock.onPost(`/api/v1/questionnaire/${questionnaireName}/uac/sample`).reply(201);

    await generateUacsForSampleFile(questionnaireName, sampleFile, true);

    expect(mock.history.post.at(-1)?.data.get("overwrite")).toBe("true");
  });

  it("It should return true if UAC generation is successful", async () => {
    mock.onPost(`/api/v1/questionnaire/${questionnaireName}/uac/sample`).reply(201);

    const result = await generateUacsForSampleFile(questionnaireName, sampleFile);

    expect(result).toStrictEqual(true);
  });

  it("It should return the error if the UAC generation is not successful", async () => {
    mock.onPost(`/api/v1/questionnaire/${questionnaireName}/uac/sample`).networkError();

    await expect(generateUacsForSampleFile(questionnaireName, sampleFile)).rejects.toThrow(
      "Network Error",
    );
  });
});

describe("getSampleFileWithUacs file tests", () => {
  beforeAll(() => {
    vi.clearAllMocks();
    mock.reset();
  });

  it("It should return null if a questionnaire name is not provided", async () => {
    await expect(getSampleFileWithUacs(undefined, fileName)).rejects.toThrow(
      "Questionnaire name was not supplied",
    );
  });

  it("It should return null if a file is not provided", async () => {
    await expect(getSampleFileWithUacs(questionnaireName, undefined)).rejects.toThrow(
      "file name was not supplied",
    );
  });

  it("It should return expected data if successful", async () => {
    mock
      .onGet(`/api/v1/questionnaire/${questionnaireName}/uac/sample/${fileName}`)
      .reply(200, mockValidSampleFileWithUacDatasResponse);

    const result = await getSampleFileWithUacs(questionnaireName, fileName);

    expect(result).toStrictEqual(mockValidSampleFileWithUacDatasResponse);
  });

  it("It should fail with response code 400 if call is a bad request", async () => {
    mock
      .onGet(`/api/v1/questionnaire/${questionnaireName}/uac/sample/${fileName}`)
      .reply(400, null);

    await expect(getSampleFileWithUacs(questionnaireName, fileName)).rejects.toThrow(
      "Request failed with status code 400",
    );
  });
});

describe("sampleFileAlreadyExists tests", () => {
  beforeAll(() => {
    vi.clearAllMocks();
    mock.reset();
  });

  it("It should return an error if a questionnaire name is not provided", async () => {
    await expect(sampleFileAlreadyExists(undefined)).rejects.toThrow(
      "Questionnaire name was not supplied",
    );
  });

  it("It should return true if a file already exists", async () => {
    mock.onGet(`/api/v1/file/${fileName}/exists`).reply(200, true);

    const result = await sampleFileAlreadyExists(questionnaireName);

    expect(result).toBeTruthy();
  });

  it("It should return false if a file does not exist", async () => {
    mock.onGet(`/api/v1/file/${fileName}/exists`).reply(200, false);

    const result = await sampleFileAlreadyExists(questionnaireName);

    expect(result).toBeFalsy();
  });

  it("It should return false when the endpoint explicitly returns 404", async () => {
    mock.onGet(`/api/v1/file/${fileName}/exists`).reply(404);

    const result = await sampleFileAlreadyExists(questionnaireName);

    expect(result).toBeFalsy();
  });

  it("It should throw if we cannot determine if a file exists", async () => {
    mock.onGet(`/api/v1/file/${fileName}/exists`).networkError();

    await expect(sampleFileAlreadyExists(questionnaireName)).rejects.toThrow("Network Error");
  });
});

describe("getListOfQuestionnairesWithExistingSampleFiles tests", () => {
  beforeAll(() => {
    vi.clearAllMocks();
    mock.reset();
  });

  it("It should return a list of existing sample files", async () => {
    mock.onGet(`/api/v1/questionnaire-names`).reply(200, mockQuestionnaireNames);

    const result = await getListOfQuestionnairesWithExistingSampleFiles();

    expect(result).toStrictEqual(mockQuestionnaireNames);
  });
});

describe("importUacsFromFile", () => {
  const sampleFile = mockFile({
    name: "sample.csv",
    type: "image/png",
    size: 50000,
  });

  beforeAll(() => {
    vi.clearAllMocks();
    mock.reset();
  });

  it("It should throw an error if file is not provided", async () => {
    await expect(importUacsFromFile(undefined)).rejects.toThrow("file was not supplied");
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

describe("disableUac", () => {
  const uac = "123456789123";

  beforeAll(() => {
    vi.clearAllMocks();
    mock.reset();
  });

  it("It should return true when disable succeeds", async () => {
    mock.onPost("/api/v1/uac/disable", { uac }).reply(200, "Success");

    await expect(disableUac(uac)).resolves.toBe(true);
  });

  it("It should return false when disable fails", async () => {
    mock.onPost("/api/v1/uac/disable", { uac }).reply(200, "Failed");

    await expect(disableUac(uac)).resolves.toBe(false);
  });
});

describe("enableUac", () => {
  const uac = "123456789123";

  beforeAll(() => {
    vi.clearAllMocks();
    mock.reset();
  });

  it("It should return true when enable succeeds", async () => {
    mock.onPost("/api/v1/uac/enable", { uac }).reply(200, "Success");

    await expect(enableUac(uac)).resolves.toBe(true);
  });

  it("It should return false when enable fails", async () => {
    mock.onPost("/api/v1/uac/enable", { uac }).reply(200, "Failed");

    await expect(enableUac(uac)).resolves.toBe(false);
  });
});

describe("getFileName", () => {
  it("It should return questionnaire name with csv extension", () => {
    expect(getFileName("DST2101A")).toBe("DST2101A.csv");
  });
});
