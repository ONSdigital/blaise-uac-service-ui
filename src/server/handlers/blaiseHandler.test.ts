import { BlaiseApiClient } from "blaise-api-node-client";
import { Auth } from "blaise-login-react-server";
import supertest, { type Response } from "supertest";

import { mockQuestionnaireList } from "../../server/test-utils/api.mock.js";
import { getConfigFromEnv } from "../config.js";
import { newServer } from "../server.js";

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

vi.mock("blaise-api-node-client");
const mockGetQuestionnaires = vi.fn();

BlaiseApiClient.prototype.getQuestionnaires = mockGetQuestionnaires;

describe("BlaiseAPI Get all questionnaires from API", () => {
  const request = supertest(newServer(config));
  const questionnaireSummaries = mockQuestionnaireList.map(({ name }) => ({ name }));

  afterEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("blaise Api should be called with the correct BlaiseApiUrl & ServerPark", async () => {
    expect(config.blaiseApiUrl).toStrictEqual("http://localhost:8081");
    expect(config.serverPark).toStrictEqual("ServerPark-mock");
  });

  it("should return a 200 status and an empty json list when API returns a empty list", async () => {
    mockGetQuestionnaires.mockImplementation(() => {
      return Promise.resolve([]);
    });

    const response = await request.get("/api/v1/questionnaires");

    expect(response.status).toEqual(200);
    expect(response.body).toHaveLength(0);
    expect(response.body).toStrictEqual([]);
  });

  it("should return a 200 status and a json list of 3 items when API returns a 3 item list", async () => {
    mockGetQuestionnaires.mockImplementation(() => {
      return Promise.resolve(mockQuestionnaireList);
    });

    await request.get("/api/v1/questionnaires").expect(200, questionnaireSummaries);
  });

  it("should return a 200 status and correctly identify erroneous questionnaires", async () => {
    const questionnaireListWithErroneous = [
      ...mockQuestionnaireList,
      {
        name: "OPN2105X",
        serverParkName: "gusty",
        installDate: "2021-05-01T00:00:00+00:00",
        status: "Erroneous",
        dataRecordCount: 0,
        hasData: false,
        fieldPeriod: "May 2021",
        blaiseVersion: "5.9.9.2735",
      },
    ];

    mockGetQuestionnaires.mockImplementation(() => {
      return Promise.resolve(questionnaireListWithErroneous);
    });

    const response = await request.get("/api/v1/questionnaires");

    expect(response.status).toEqual(200);
    expect(response.body).toHaveLength(4);
  });

  it("should return a 500 status direct from the API", async () => {
    mockGetQuestionnaires.mockImplementation(() => {
      return Promise.reject();
    });

    const response: Response = await request.get("/api/v1/questionnaires");

    expect(response.status).toEqual(500);
  });

  it("should return a 500 status when API rejects with an Error instance", async () => {
    mockGetQuestionnaires.mockImplementation(() => {
      return Promise.reject(new Error("blaise failure"));
    });

    const response: Response = await request.get("/api/v1/questionnaires");

    expect(response.status).toEqual(500);
  });

  it("should return a 500 status when API throws a non-Error object", async () => {
    mockGetQuestionnaires.mockImplementation(() => {
      throw "non-error string";
    });

    const response: Response = await request.get("/api/v1/questionnaires");

    expect(response.status).toEqual(500);
  });
});
