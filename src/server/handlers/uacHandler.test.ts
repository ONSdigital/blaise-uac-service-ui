import { Auth } from "blaise-login-react-server";
import { BusClient } from "blaise-uac-service-node-client";
import express from "express";
import supertest from "supertest";

import { mockDisabledUacsForQuestionnaire } from "../../server/test-utils/api.mock.js";
import { getConfigFromEnv } from "../config.js";
import { newServer } from "../server.js";

import createUacHandler, { compareDisabledUacRows } from "./uacHandler.js";

import type { BlaiseApiClient } from "blaise-api-node-client";
import type * as BlaiseLoginReactServer from "blaise-login-react-server";

vi.mock("blaise-login-react-server", async (importOriginal) => {
  const express = await import("express");
  const mod = await importOriginal<typeof BlaiseLoginReactServer>();

  return {
    ...mod,
    newLoginHandler: vi.fn(() => express.default.Router()),
  };
});
Auth.prototype.middleware = vi.fn().mockImplementation((_req, _res, next) => next());

const config = getConfigFromEnv();

vi.mock("blaise-uac-service-node-client");
const mockDisableUac = vi.fn();
const mockEnableUac = vi.fn();
const mockGetDisabledUacs = vi.fn();
const mockGetQuestionnaires = vi.fn();

BusClient.prototype.disableUac = mockDisableUac;
BusClient.prototype.enableUac = mockEnableUac;
BusClient.prototype.getDisabledUacs = mockGetDisabledUacs;

describe("Environment variables are correctly set for Bus Client ", () => {
  supertest(newServer(config));

  afterEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("bus client should be called with the correct BusUrl and BusClientId", async () => {
    expect(config.busUrl).toStrictEqual("http://localhost:8080");
    expect(config.busClientId).toStrictEqual("BusClientId-mock");
  });
});

describe("BusClientApi works and disable functionality works correctly", () => {
  const request = supertest(newServer(config));

  afterEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("should return a 200 status and disables the UAC received in request body", async () => {
    mockDisableUac.mockImplementation(() => {
      return Promise.resolve("Success");
    });

    const response = await request.post("/api/v1/uac/disable").send({ uac: "123456789123" });

    expect(mockDisableUac).toBeCalledWith("123456789123");
    expect(response.status).toEqual(200);
    expect(response.body).toStrictEqual("Success");
  });

  it("should return a 400 status for an invalid UAC format", async () => {
    const response = await request.post("/api/v1/uac/disable").send({ uac: "123" });

    expect(response.status).toEqual(400);
    expect(mockDisableUac).not.toHaveBeenCalled();
  });

  it("should return a 500 status if the BUS client fails to disable a UAC", async () => {
    const uac = "999999999999";

    mockDisableUac.mockImplementation(() => {
      return Promise.reject(new Error("Disable failed"));
    });

    const response = await request.post("/api/v1/uac/disable").send({ uac });

    expect(mockDisableUac).toBeCalledWith(uac);
    expect(response.status).toEqual(500);
    expect(response.body).toStrictEqual("Disabling UAC failed");
  });

  it("should return a 500 status when BUS client throws a non-Error object on disable", async () => {
    mockDisableUac.mockImplementation(() => {
      throw "non-error string";
    });

    const response = await request.post("/api/v1/uac/disable").send({ uac: "123456789123" });

    expect(response.status).toEqual(500);
    expect(response.body).toStrictEqual("Disabling UAC failed");
  });
});

describe("BusClientApi works and enable functionality works correctly", () => {
  const request = supertest(newServer(config));

  afterEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("should return a 200 status and enable the UAC received in request body", async () => {
    mockEnableUac.mockImplementation(() => {
      return Promise.resolve("Success");
    });

    const response = await request.post("/api/v1/uac/enable").send({ uac: "123456789123" });

    expect(mockEnableUac).toBeCalledWith("123456789123");
    expect(response.status).toEqual(200);
    expect(response.body).toStrictEqual("Success");
  });

  it("should return a 400 status for an invalid UAC format", async () => {
    const response = await request.post("/api/v1/uac/enable").send({ uac: "123" });

    expect(response.status).toEqual(400);
    expect(mockEnableUac).not.toHaveBeenCalled();
  });

  it("should return a 500 status if the BUS client fails to enable a UAC", async () => {
    const uac = "999999999999";

    mockEnableUac.mockImplementation(() => {
      return Promise.reject(new Error("Enable failed"));
    });

    const response = await request.post("/api/v1/uac/enable").send({ uac });

    expect(mockEnableUac).toBeCalledWith(uac);
    expect(response.status).toEqual(500);
    expect(response.body).toStrictEqual("Enabling UAC failed");
  });

  it("should return a 500 status when BUS client throws a non-Error object on enable", async () => {
    mockEnableUac.mockImplementation(() => {
      throw "non-error string";
    });

    const response = await request.post("/api/v1/uac/enable").send({ uac: "123456789123" });

    expect(response.status).toEqual(500);
    expect(response.body).toStrictEqual("Enabling UAC failed");
  });
});

describe("BusClientApi works and fetches all disabled UACs for questionnaire correctly", () => {
  const request = supertest(newServer(config));

  afterEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("should return a 200 status and returns all disabled UACs for questionnaire provided in url param", async () => {
    mockGetDisabledUacs.mockImplementation(() => {
      return Promise.resolve(mockDisabledUacsForQuestionnaire);
    });

    const response = await request.get("/api/v1/questionnaire/lms2209_em1/disabled-uacs");

    expect(mockGetDisabledUacs).toBeCalledWith("lms2209_em1");
    expect(response.status).toEqual(200);
    expect(response.body).toStrictEqual(mockDisabledUacsForQuestionnaire);
  });

  it("should return a 400 status for an invalid questionnaire name", async () => {
    const response = await request.get("/api/v1/questionnaire/invalid/disabled-uacs");

    expect(response.status).toEqual(400);
    expect(mockGetDisabledUacs).not.toHaveBeenCalled();
  });

  it("should return a 500 status if the BUS client fails to get disabled UACs", async () => {
    mockGetDisabledUacs.mockImplementation(() => {
      return Promise.reject(new Error("Get disabled UACs failed"));
    });

    const response = await request.get("/api/v1/questionnaire/lms2209_em1/disabled-uacs");

    expect(response.status).toEqual(500);
    expect(response.body).toStrictEqual("Fetching disabled UACs failed");
  });

  it("should return a 500 status when BUS client throws a non-Error object on getDisabledUacs", async () => {
    mockGetDisabledUacs.mockImplementation(() => {
      throw "non-error string";
    });

    const response = await request.get("/api/v1/questionnaire/lms2209_em1/disabled-uacs");

    expect(response.status).toEqual(500);
    expect(response.body).toStrictEqual("Fetching disabled UACs failed");
  });
});

describe("BusClientError treated as success for disable UAC", () => {
  const request = supertest(newServer(config));

  afterEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("should return a 200 status when BusClient throws BusClientError with no statusCode on disable", async () => {
    const { BusClientError } = await import("blaise-uac-service-node-client");

    mockDisableUac.mockImplementation(() => {
      throw new BusClientError("null response");
    });

    const response = await request.post("/api/v1/uac/disable").send({ uac: "123456789123" });

    expect(response.status).toEqual(200);
    expect(response.body).toStrictEqual("Success");
  });

  it("should return a 200 status when BusClient throws BusClientError with no statusCode on enable", async () => {
    const { BusClientError } = await import("blaise-uac-service-node-client");

    mockEnableUac.mockImplementation(() => {
      throw new BusClientError("null response");
    });

    const response = await request.post("/api/v1/uac/enable").send({ uac: "123456789123" });

    expect(response.status).toEqual(200);
    expect(response.body).toStrictEqual("Success");
  });
});

describe("aggregate disabled UAC endpoint", () => {
  const auth = { middleware: (_req: unknown, _res: unknown, next: () => void) => next() } as Auth;
  const mockBusClient = {
    getDisabledUacs: mockGetDisabledUacs,
    disableUac: vi.fn(),
    enableUac: vi.fn(),
  } as unknown as BusClient;
  const mockBlaiseApiClient = {
    getQuestionnaires: mockGetQuestionnaires,
  } as unknown as { getQuestionnaires: (serverPark: string) => Promise<unknown[]> };

  const app = express();

  app.use(express.json());
  app.use((req, _res, next) => {
    Object.assign(req, { log: { error: vi.fn(), info: vi.fn(), warn: vi.fn() } });
    next();
  });
  app.use(
    "/",
    createUacHandler(
      mockBusClient,
      auth,
      mockBlaiseApiClient as unknown as BlaiseApiClient,
      "ServerPark-mock",
    ),
  );

  const request = supertest(app);

  afterEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("returns sorted disabled UAC rows across active questionnaires", async () => {
    mockGetQuestionnaires.mockResolvedValueOnce([
      { name: "LMS2209_EM1", status: "Active" },
      { name: "lms2207_ho1", status: "Erroneous" },
      { name: "ABC1234A", status: undefined },
      { name: "ZZZ9999A", status: "Failed" },
    ]);

    mockGetDisabledUacs.mockImplementation(async (questionnaire: string) => {
      if (questionnaire === "LMS2209_EM1") {
        return {
          skipNoCase: {
            case_id: "",
            uac_chunks: { uac1: "0001", uac2: "0002", uac3: "0003" },
            disabled: true,
          },
          byChunks: {
            case_id: "0002",
            questionnaire_name: "lms2209_em1",
            uac_chunks: { uac1: "1111", uac2: "2222", uac3: "3333", uac4: "4444" },
            disabled: true,
          },
          byChunksNoUac4OrQuestionnaireName: {
            case_id: "0003",
            uac_chunks: { uac1: "5555", uac2: "6666", uac3: "7777" },
            disabled: true,
          },
        };
      }

      if (questionnaire === "ABC1234A") {
        return {
          withFullUac: {
            case_id: "0001",
            questionnaire_name: "abc1234a",
            uac_chunks: { uac1: "9999", uac2: "9999", uac3: "9999" },
            full_uac: "123456789123",
            disabled: true,
          },
        };
      }

      throw new Error("unexpected questionnaire");
    });

    const response = await request.get("/api/v1/disabled-uacs");

    expect(response.status).toEqual(200);
    expect(response.body).toStrictEqual([
      { questionnaire: "ABC1234A", caseId: "0001", uac: "123456789123" },
      { questionnaire: "LMS2209_EM1", caseId: "0002", uac: "1111222233334444" },
      { questionnaire: "LMS2209_EM1", caseId: "0003", uac: "555566667777" },
    ]);
    expect(mockGetDisabledUacs).toHaveBeenCalledTimes(2);
    expect(mockGetDisabledUacs).toHaveBeenCalledWith("LMS2209_EM1");
    expect(mockGetDisabledUacs).toHaveBeenCalledWith("ABC1234A");
    expect(mockGetDisabledUacs).not.toHaveBeenCalledWith("lms2207_ho1");
    expect(mockGetDisabledUacs).not.toHaveBeenCalledWith("ZZZ9999A");
  });

  it("continues when one questionnaire disabled-UAC fetch fails", async () => {
    mockGetQuestionnaires.mockResolvedValueOnce([
      { name: "ABC1234A", status: "Active" },
      { name: "DST1234A", status: "Active" },
    ]);

    mockGetDisabledUacs.mockImplementation(async (questionnaire: string) => {
      if (questionnaire === "ABC1234A") {
        throw new Error("BUS failure");
      }

      return {
        good: {
          case_id: "1000",
          questionnaire_name: "dst1234a",
          uac_chunks: { uac1: "1000", uac2: "2000", uac3: "3000" },
          full_uac: "100020003000",
          disabled: true,
        },
      };
    });

    const response = await request.get("/api/v1/disabled-uacs");

    expect(response.status).toEqual(200);
    expect(response.body).toStrictEqual([
      { questionnaire: "DST1234A", caseId: "1000", uac: "100020003000" },
    ]);
  });

  it("returns a 500 response when questionnaires lookup fails", async () => {
    mockGetQuestionnaires.mockRejectedValueOnce(new Error("Blaise failure"));

    const response = await request.get("/api/v1/disabled-uacs");

    expect(response.status).toEqual(500);
    expect(response.body).toStrictEqual("Fetching all disabled UACs failed");
  });

  it("returns a 500 response when questionnaires lookup throws a non-Error", async () => {
    mockGetQuestionnaires.mockRejectedValueOnce("non-error string");

    const response = await request.get("/api/v1/disabled-uacs");

    expect(response.status).toEqual(500);
    expect(response.body).toStrictEqual("Fetching all disabled UACs failed");
  });

  it("returns a 500 response if Blaise client is not configured", async () => {
    const app = express();
    const auth = { middleware: (_req: unknown, _res: unknown, next: () => void) => next() } as Auth;

    app.use(express.json());
    app.use("/", createUacHandler({} as BusClient, auth));

    const response = await supertest(app).get("/api/v1/disabled-uacs");

    expect(response.status).toEqual(500);
    expect(response.body).toStrictEqual("Blaise API client not configured");
  });
});

describe("compareDisabledUacRows", () => {
  it("returns -1 when questionnaire is alphabetically smaller", () => {
    expect(
      compareDisabledUacRows(
        { questionnaire: "ABC1234A", caseId: "0001" },
        { questionnaire: "DST1234A", caseId: "0001" },
      ),
    ).toBe(-1);
  });

  it("returns 1 when questionnaire is alphabetically larger", () => {
    expect(
      compareDisabledUacRows(
        { questionnaire: "ZZZ1234A", caseId: "0001" },
        { questionnaire: "ABC1234A", caseId: "0001" },
      ),
    ).toBe(1);
  });

  it("returns -1 when questionnaires match and caseId is smaller", () => {
    expect(
      compareDisabledUacRows(
        { questionnaire: "DST1234A", caseId: "0001" },
        { questionnaire: "DST1234A", caseId: "0002" },
      ),
    ).toBe(-1);
  });

  it("returns 1 when questionnaires match and caseId is larger", () => {
    expect(
      compareDisabledUacRows(
        { questionnaire: "DST1234A", caseId: "0002" },
        { questionnaire: "DST1234A", caseId: "0001" },
      ),
    ).toBe(1);
  });

  it("returns 0 when questionnaire and caseId are equal", () => {
    expect(
      compareDisabledUacRows(
        { questionnaire: "DST1234A", caseId: "0001" },
        { questionnaire: "DST1234A", caseId: "0001" },
      ),
    ).toBe(0);
  });
});
