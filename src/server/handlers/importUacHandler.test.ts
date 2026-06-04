import { getMockReq, getMockRes } from "@jest-mock/express";
import { BusClient } from "blaise-uac-service-node-client";

import { mockMulterFile } from "../../server/test-utils/file.mock.js";
import { getConfigFromEnv } from "../config.js";
import { getUacsFromFile } from "../utils/csvParser.js";
import { CsvValidationError } from "../validation.js";

import { ImportUacHandler } from "./importUacHandler.js";

import type { AxiosError, AxiosResponse } from "axios";
import type { Mock } from "vitest";

const config = getConfigFromEnv();

vi.mock("blaise-uac-service-node-client");
const mockImportUacs = vi.fn();

BusClient.prototype.importUacs = mockImportUacs;
const mockBusClient = new BusClient(config.busUrl, config.busClientId);

vi.mock("../utils/csvParser.js");

const getUacsFromFileMock = getUacsFromFile as Mock<() => Promise<string[]>>;

function mockReqWithLog() {
  const req = getMockReq();

  Object.assign(req, { log: { error: vi.fn(), info: vi.fn(), warn: vi.fn() } });

  return req;
}

const { res, mockClear } = getMockRes();
const uacFile = mockMulterFile({
  filename: "uacs.csv",
  path: "/temp/uacs.csv",
  mimetype: "text/csv",
  size: 50000,
});

describe("import uac tests", () => {
  beforeEach(() => {
    mockClear();
    vi.clearAllMocks();
    vi.resetModules();
    setMocksForSuccess();
  });

  it("return 200 and count of imported UACs when all goes well", async () => {
    const req = mockReqWithLog();

    req.file = uacFile;

    const importUacHandler = new ImportUacHandler(mockBusClient);

    await importUacHandler.importUacs(req, res);
    expect(res.json).toHaveBeenCalledWith({ uacs_imported: 2 });
  });

  it("returns a status 500 if UACs cannot be read from file", async () => {
    const req = mockReqWithLog();

    req.file = uacFile;

    getUacsFromFileMock.mockImplementation(() => {
      throw new Error();
    });

    const importUacHandler = new ImportUacHandler(mockBusClient);

    await importUacHandler.importUacs(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith("Could not import uacs, please try again");
  });

  it("returns a status 500 if UACs could not be imported", async () => {
    const req = mockReqWithLog();

    req.file = uacFile;

    mockImportUacs.mockImplementation(() => {
      throw new Error();
    });

    const importUacHandler = new ImportUacHandler(mockBusClient);

    await importUacHandler.importUacs(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith("Could not import uacs, please try again");
  });

  it("returns a status 500 if UACs could not be imported with a non-Error object", async () => {
    const req = mockReqWithLog();

    req.file = uacFile;

    mockImportUacs.mockImplementation(() => {
      throw "non-error string";
    });

    const importUacHandler = new ImportUacHandler(mockBusClient);

    await importUacHandler.importUacs(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith("Could not import uacs, please try again");
  });

  it("returns the status code and response body from import UAC, if it can get them from an error", async () => {
    const req = mockReqWithLog();

    req.file = uacFile;

    mockImportUacs.mockImplementation(() => {
      const error: AxiosError = <AxiosError>{};
      const response: AxiosResponse = <AxiosResponse>{};

      response.status = 400;
      response.data = { error: "Something went wrong" };
      error.response = response;
      error.isAxiosError = true;
      throw error;
    });

    const importUacHandler = new ImportUacHandler(mockBusClient);

    await importUacHandler.importUacs(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Something went wrong" });
  });

  it("returns 500 when axios error has response data without error key", async () => {
    const req = mockReqWithLog();

    req.file = uacFile;

    mockImportUacs.mockImplementation(() => {
      const error: AxiosError = <AxiosError>{};
      const response: AxiosResponse = <AxiosResponse>{};

      response.status = 400;
      response.data = { message: "no error key here" };
      error.response = response;
      error.isAxiosError = true;
      throw error;
    });

    const importUacHandler = new ImportUacHandler(mockBusClient);

    await importUacHandler.importUacs(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith("Could not import uacs, please try again");
  });

  it("returns 400 if no file is supplied", async () => {
    const req = mockReqWithLog();
    const importUacHandler = new ImportUacHandler(mockBusClient);

    await importUacHandler.importUacs(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith("File not supplied");
  });

  it("returns 400 when getUacsFromFile throws an error matching UAC column not in CSV", async () => {
    const req = mockReqWithLog();

    req.file = uacFile;

    getUacsFromFileMock.mockImplementation(() => {
      throw new CsvValidationError(
        "Column UAC is not in the CSV file. Column names are case sensitive.",
      );
    });

    const importUacHandler = new ImportUacHandler(mockBusClient);

    await importUacHandler.importUacs(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Column UAC is not in the CSV file. Column names are case sensitive.",
    });
  });

  afterEach(() => {
    mockClear();
    vi.clearAllMocks();
    vi.resetModules();
  });
});

describe("import uac audit logging", () => {
  beforeEach(() => {
    setMocksForSuccess();
  });

  afterEach(() => {
    mockClear();
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("writes an audit success log when import completes", async () => {
    const req = mockReqWithLog();

    req.file = uacFile;

    const auditLogger = { info: vi.fn(), error: vi.fn() };
    const auth = {
      getToken: vi.fn().mockReturnValue("token"),
      getUser: vi.fn().mockReturnValue({ name: "rich" }),
    };

    const importUacHandler = new ImportUacHandler(
      mockBusClient,
      auth as unknown as ConstructorParameters<typeof ImportUacHandler>[1],
      auditLogger,
    );

    await importUacHandler.importUacs(req, res);

    expect(auditLogger.info).toHaveBeenCalledWith(
      req.log,
      "rich uploaded used UACs file originalNameTest",
    );
    expect(auditLogger.error).not.toHaveBeenCalled();
  });

  it("writes an audit failure log for server errors but not CSV validation errors", async () => {
    const req = mockReqWithLog();

    req.file = uacFile;

    const auditLogger = { info: vi.fn(), error: vi.fn() };
    const auth = {
      getToken: vi.fn().mockReturnValue("token"),
      getUser: vi.fn().mockReturnValue({ name: "rich" }),
    };

    mockImportUacs.mockImplementationOnce(() => {
      throw new Error("backend failed");
    });

    const importUacHandler = new ImportUacHandler(
      mockBusClient,
      auth as unknown as ConstructorParameters<typeof ImportUacHandler>[1],
      auditLogger,
    );

    await importUacHandler.importUacs(req, res);

    expect(auditLogger.error).toHaveBeenCalledWith(
      req.log,
      "rich failed to upload used UACs file originalNameTest",
    );

    mockClear();
    vi.clearAllMocks();
    setMocksForSuccess();

    const validationReq = mockReqWithLog();

    validationReq.file = uacFile;

    getUacsFromFileMock.mockImplementationOnce(() => {
      throw new CsvValidationError("Column UAC is not in the CSV file.");
    });

    await importUacHandler.importUacs(validationReq, res);

    expect(auditLogger.error).not.toHaveBeenCalled();
  });
});

function setMocksForSuccess() {
  mockImportUacs.mockReturnValue(Promise.resolve({ uacs_imported: 2 }));
  getUacsFromFileMock.mockReturnValue(Promise.resolve(["123412341234", "432143214321"]));
}
