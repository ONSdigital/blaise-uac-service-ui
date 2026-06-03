import { getMockReq, getMockRes } from "@jest-mock/express";
import { BusClient } from "blaise-uac-service-node-client";

import {
  mockMatchedQuestionnaireUacDetails,
  mockValidSampleCsv,
  mockValidSampleFileWithUacArrayResponse,
} from "../../server/test-utils/csv.mock.js";
import { mockMulterFile } from "../../server/test-utils/file.mock.js";
import { getConfigFromEnv } from "../config.js";
import { GoogleStorage, SampleFileExistsError } from "../storage/googleStorageFunctions.js";
import { addUacsToFile, getCaseIdsFromFile } from "../utils/csvParser.js";
import { CsvValidationError } from "../validation.js";

import { QuestionnaireUacHandler } from "./questionnaireUacHandler.js";

import type { AxiosError, AxiosResponse } from "axios";
import type { Mock } from "vitest";

const config = getConfigFromEnv();

vi.mock("blaise-uac-service-node-client");
const mockGenerateUacs = vi.fn();

BusClient.prototype.generateUacs = mockGenerateUacs;
const mockGetUacsByCaseId = vi.fn();

BusClient.prototype.getUacsByCaseId = mockGetUacsByCaseId;
const busClientMock = new BusClient(config.busUrl, config.busClientId);

vi.mock("../storage/googleStorageFunctions.js");
const mockUploadFileToBucket = vi.fn();
const mockFileExistsInBucket = vi.fn();

GoogleStorage.prototype.uploadFileToBucket = mockUploadFileToBucket;
GoogleStorage.prototype.fileExistsInBucket = mockFileExistsInBucket;
const getFileFromBucketMock = vi.fn();

GoogleStorage.prototype.getFileFromBucket = getFileFromBucketMock;
const googleStorageMock = new GoogleStorage(config.projectId);

vi.mock("../utils/csvParser.js");

const getCaseIdsFromFileMock = getCaseIdsFromFile as Mock<() => Promise<string[]>>;
const addUacsToFileMock = addUacsToFile as Mock<() => Promise<Record<string, string>[]>>;

function mockReqWithLog() {
  const req = getMockReq();

  Object.assign(req, { log: { error: vi.fn(), info: vi.fn(), warn: vi.fn() } });

  return req;
}

const { res, mockClear } = getMockRes();
const questionnaireName = "DST1234A";
const filename = `${questionnaireName}.csv`;
const fileData = Buffer.from(mockValidSampleCsv);
const caseIds = ["100000001", "100000002"];

const sampleFile = mockMulterFile({
  filename: "sample.csv",
  path: "/temp/sample.csv",
  mimetype: "image/png",
  size: 50000,
});

describe("generate uac from sample tests", () => {
  beforeEach(() => {
    mockClear();
    vi.clearAllMocks();
    vi.resetModules();
    setMocksForSuccess();
  });

  it("It should return a 400 if the questionnaire name is invalid", async () => {
    const req = mockReqWithLog();

    req.params.questionnaireName = "invalid";
    req.file = sampleFile;
    const questionnaireUacHandler = new QuestionnaireUacHandler(
      busClientMock,
      googleStorageMock,
      config,
    );

    await questionnaireUacHandler.generateUacsForSampleFile(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith("Invalid questionnaire name");
  });

  it("It should return a 400 if an file is not provided", async () => {
    const req = mockReqWithLog();

    req.params.questionnaireName = questionnaireName;
    const questionnaireUacHandler = new QuestionnaireUacHandler(
      busClientMock,
      googleStorageMock,
      config,
    );

    await questionnaireUacHandler.generateUacsForSampleFile(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith("File not supplied");
  });

  it("Upload file should be called with correct parameters with filename normalised to uppercase", async () => {
    await callGenerateUacsForSampleFileWithParameters();

    expect(mockUploadFileToBucket).toHaveBeenCalledWith(
      "BucketName-mock",
      sampleFile,
      `${questionnaireName}.csv`,
      false,
    );
  });

  it("It should return a 409 response if a sample file already exists and overwrite is false", async () => {
    mockFileExistsInBucket.mockResolvedValueOnce(true);

    await callGenerateUacsForSampleFileWithParameters();

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      error: `A sample file already exists for ${questionnaireName}`,
    });
    expect(mockGenerateUacs).not.toHaveBeenCalled();
    expect(mockUploadFileToBucket).not.toHaveBeenCalled();
  });

  it("It should allow overwrite when overwrite=true is supplied", async () => {
    await callGenerateUacsForSampleFileWithParameters({ overwrite: "true" });

    expect(mockUploadFileToBucket).toHaveBeenCalledWith(
      "BucketName-mock",
      sampleFile,
      `${questionnaireName}.csv`,
      true,
    );
  });

  it("It should return a 201 response with expected data if uac generation is successful", async () => {
    await callGenerateUacsForSampleFileWithParameters();

    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("It should return a 500 response if the uac generation fails", async () => {
    mockGenerateUacs.mockImplementation(() => {
      throw new Error("Cannot generate uacs");
    });

    await callGenerateUacsForSampleFileWithParameters();

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Cannot generate uacs" });
  });

  it("It should return a 400 response if the file fails validation", async () => {
    getCaseIdsFromFileMock.mockImplementation(() => {
      throw new CsvValidationError("Something went wrong getting case ids");
    });

    await callGenerateUacsForSampleFileWithParameters();

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Something went wrong getting case ids" });
  });

  it("It should return a 500 response if the upload fails", async () => {
    mockGenerateUacs.mockReturnValue(true);
    mockUploadFileToBucket.mockImplementation(() => {
      const error: AxiosError = <AxiosError>{};
      const response: AxiosResponse = <AxiosResponse>{};

      response.status = 400;
      response.data = "Something went wrong uploading file to bucket";
      error.response = response;
      error.isAxiosError = true;
      throw error;
    });

    await callGenerateUacsForSampleFileWithParameters();

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Something went wrong uploading file to bucket",
    });
  });

  it("It should return a 500 response with structured axios error data", async () => {
    mockGenerateUacs.mockReturnValue(true);
    mockUploadFileToBucket.mockImplementation(() => {
      const error: AxiosError = <AxiosError>{};
      const response: AxiosResponse = <AxiosResponse>{};

      response.status = 500;
      response.data = { error: "Structured upload failure" };
      error.response = response;
      error.isAxiosError = true;
      throw error;
    });

    await callGenerateUacsForSampleFileWithParameters();

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Structured upload failure" });
  });

  it("It should return a 409 response if storage rejects a concurrent overwrite", async () => {
    mockUploadFileToBucket.mockRejectedValueOnce(
      new SampleFileExistsError(`${questionnaireName}.csv`),
    );

    await callGenerateUacsForSampleFileWithParameters({ overwrite: "false" });

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      error: `A sample file already exists for ${questionnaireName}`,
    });
  });

  it("It should return a 500 response with unexpected error when a non-Error is thrown", async () => {
    mockGenerateUacs.mockImplementation(() => {
      throw "non-error string";
    });

    await callGenerateUacsForSampleFileWithParameters();

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "An unexpected error occurred" });
  });

  it("It should return a 500 response with axios string data as error when axios error has string data", async () => {
    getCaseIdsFromFileMock.mockImplementation(() => {
      const error: AxiosError = <AxiosError>{};
      const response: AxiosResponse = <AxiosResponse>{};

      response.status = 500;
      response.data = undefined;
      error.response = response;
      error.isAxiosError = true;
      throw error;
    });

    await callGenerateUacsForSampleFileWithParameters();

    expect(res.status).toHaveBeenCalledWith(500);
  });

  afterEach(() => {
    mockClear();
    vi.clearAllMocks();
    vi.resetModules();
  });
});

describe("get uacs for sample file tests", () => {
  beforeEach(() => {
    mockClear();
    vi.clearAllMocks();
    vi.resetModules();
    setMocksForSuccess();
  });

  it("It should return a 400 if the questionnaire name is invalid", async () => {
    const req = mockReqWithLog();

    req.params.questionnaireName = "invalid";
    req.params.fileName = filename;
    const questionnaireUacHandler = new QuestionnaireUacHandler(
      busClientMock,
      googleStorageMock,
      config,
    );

    await questionnaireUacHandler.getSampleFileWithUacs(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith("Invalid questionnaire name");
  });

  it("It should return a 400 if the filename is invalid", async () => {
    const req = mockReqWithLog();

    req.params.questionnaireName = questionnaireName;
    req.params.fileName = "troodon.txt";
    const questionnaireUacHandler = new QuestionnaireUacHandler(
      busClientMock,
      googleStorageMock,
      config,
    );

    await questionnaireUacHandler.getSampleFileWithUacs(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith("Invalid filename");
  });

  it("Get file should be called with canonical uppercase filename if successful", async () => {
    await callGetSampleFileWithParameters();

    expect(getFileFromBucketMock).toHaveBeenCalledWith(config.bucketName, filename);
  });

  it("Add UACs to file should be called with correct parameters if successful", async () => {
    await callGetSampleFileWithParameters();

    expect(addUacsToFileMock).toHaveBeenCalledWith(fileData, mockMatchedQuestionnaireUacDetails);
  });

  it("It should return a 200 response with expected data if uac generation is successful", async () => {
    await callGetSampleFileWithParameters();

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockValidSampleFileWithUacArrayResponse);
  });

  it("It should return a 400 bad request response with a structured validation error", async () => {
    getFileFromBucketMock.mockReturnValue(Promise.resolve(fileData));

    mockGetUacsByCaseId.mockReturnValue(Promise.resolve(mockMatchedQuestionnaireUacDetails));

    addUacsToFileMock.mockImplementation(() => {
      throw new CsvValidationError(
        "The sample file contains a case ID that does not match generated UACs on row 2",
      );
    });

    await callGetSampleFileWithParameters();

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "The sample file contains a case ID that does not match generated UACs on row 2",
    });
  });

  it("It should return a 500 response if getting the file from the bucket fails", async () => {
    getFileFromBucketMock.mockImplementation(() => {
      throw new Error();
    });

    await callGetSampleFileWithParameters();

    expect(res.status).toHaveBeenCalledWith(500);
  });

  it("It should return a 500 response if getting the uac details from the bus client fails", async () => {
    getFileFromBucketMock.mockReturnValue(Promise.resolve(fileData));

    mockGetUacsByCaseId.mockImplementation(() => {
      throw new Error();
    });

    await callGetSampleFileWithParameters();

    expect(res.status).toHaveBeenCalledWith(500);
  });

  it("It should return a 500 response if getting the file from the bucket fails with a non-Error", async () => {
    getFileFromBucketMock.mockImplementation(() => {
      throw "non-error string";
    });

    await callGetSampleFileWithParameters();

    expect(res.status).toHaveBeenCalledWith(500);
  });

  it("It should rethrow the original uppercase read error when canonical and lowercase filenames are identical", async () => {
    const questionnaireUacHandler = new QuestionnaireUacHandler(
      busClientMock,
      googleStorageMock,
      config,
    );
    const readError = new Error("read failed");

    getFileFromBucketMock.mockRejectedValueOnce(readError);

    const privateHandler = questionnaireUacHandler as unknown as {
      getSampleFileBuffer: (fileName: string) => Promise<Buffer>;
    };

    await expect(privateHandler.getSampleFileBuffer("1234.csv")).rejects.toBe(readError);
    expect(getFileFromBucketMock).toHaveBeenCalledTimes(1);
    expect(getFileFromBucketMock).toHaveBeenCalledWith(config.bucketName, "1234.csv");
  });

  afterEach(() => {
    mockClear();
    vi.clearAllMocks();
    vi.resetModules();
  });
});

async function callGenerateUacsForSampleFileWithParameters(body: Record<string, string> = {}) {
  const req = mockReqWithLog();

  req.params.questionnaireName = questionnaireName;
  req.file = sampleFile;
  req.body = body;
  const questionnaireUacHandler = new QuestionnaireUacHandler(
    busClientMock,
    googleStorageMock,
    config,
  );

  await questionnaireUacHandler.generateUacsForSampleFile(req, res);
}

async function callGetSampleFileWithParameters() {
  const req = mockReqWithLog();

  req.params.questionnaireName = questionnaireName;
  req.params.fileName = filename;
  const questionnaireUacHandler = new QuestionnaireUacHandler(
    busClientMock,
    googleStorageMock,
    config,
  );

  await questionnaireUacHandler.getSampleFileWithUacs(req, res);
}

function setMocksForSuccess() {
  getFileFromBucketMock.mockReturnValue(Promise.resolve(fileData));

  mockGetUacsByCaseId.mockReturnValue(Promise.resolve(mockMatchedQuestionnaireUacDetails));

  addUacsToFileMock.mockReturnValue(Promise.resolve(mockValidSampleFileWithUacArrayResponse));

  getCaseIdsFromFileMock.mockReturnValue(Promise.resolve(caseIds));
  mockFileExistsInBucket.mockResolvedValue(false);
}
