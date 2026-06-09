import { Auth } from "blaise-login-react-server";
import supertest from "supertest";

import { getConfigFromEnv } from "../config.js";
import { newServer } from "../server.js";
import { GoogleStorage } from "../storage/googleStorageFunctions.js";

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

//mock google storage

vi.mock("../storage/googleStorageFunctions.js");
const getFilesWithMetadataInBucketMock = vi.fn();

GoogleStorage.prototype.getFilesWithMetadataInBucket = getFilesWithMetadataInBucketMock;

const config = getConfigFromEnv();

describe("questionnaire-samples-handler tests", () => {
  const server = newServer(config);
  const request = supertest(server);
  const url = "/api/v1/questionnaire-names";

  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("It should be called with correct parameters with filename converted to lowercase", async () => {
    getFilesWithMetadataInBucketMock.mockImplementationOnce(() => {
      return Promise.resolve([]);
    });

    await request.get(url).expect(200);

    expect(getFilesWithMetadataInBucketMock).toHaveBeenCalledWith("BucketName-mock");
  });

  it("It should return a 200 response with list of expected questionnaires in uppercase", async () => {
    getFilesWithMetadataInBucketMock.mockImplementationOnce(() => {
      const files = [
        { name: "dst1234a.csv", updated: "2024-01-15T14:41:29.000Z" },
        { name: "DST5432A.csv", updated: "2024-03-10T09:00:00.000Z" },
      ];

      return Promise.resolve(files);
    });

    await request.get(url).expect(200, [
      { questionnaireName: "DST1234A", lastModified: "2024-01-15T14:41:29.000Z" },
      { questionnaireName: "DST5432A", lastModified: "2024-03-10T09:00:00.000Z" },
    ]);
  });

  it("It should filter out any non CSV files", async () => {
    getFilesWithMetadataInBucketMock.mockImplementationOnce(() => {
      const files = [
        { name: "dst1234a.csv", updated: "2024-01-15T14:41:29.000Z" },
        { name: "randomFile.bak", updated: "2024-01-10T10:00:00.000Z" },
        { name: "DST5432A.csv", updated: "2024-03-10T09:00:00.000Z" },
      ];

      return Promise.resolve(files);
    });

    await request.get(url).expect(200, [
      { questionnaireName: "DST1234A", lastModified: "2024-01-15T14:41:29.000Z" },
      { questionnaireName: "DST5432A", lastModified: "2024-03-10T09:00:00.000Z" },
    ]);
  });

  it("It should deduplicate files that differ only by questionnaire name casing", async () => {
    getFilesWithMetadataInBucketMock.mockImplementationOnce(() => {
      const files = [
        { name: "dia2605a.csv", updated: "2024-05-10T09:00:00.000Z" },
        { name: "DIA2605A.csv", updated: "2024-05-11T09:00:00.000Z" },
      ];

      return Promise.resolve(files);
    });

    await request
      .get(url)
      .expect(200, [{ questionnaireName: "DIA2605A", lastModified: "2024-05-11T09:00:00.000Z" }]);
  });

  it("It should keep the newest entry when an older duplicate appears later", async () => {
    getFilesWithMetadataInBucketMock.mockImplementationOnce(() => {
      const files = [
        { name: "DIA2605A.csv", updated: "2024-05-11T09:00:00.000Z" },
        { name: "dia2605a.csv", updated: "2024-05-10T09:00:00.000Z" },
      ];

      return Promise.resolve(files);
    });

    await request
      .get(url)
      .expect(200, [{ questionnaireName: "DIA2605A", lastModified: "2024-05-11T09:00:00.000Z" }]);
  });

  it("It should return a 500 response if retrieving the questionnaire list fails", async () => {
    getFilesWithMetadataInBucketMock.mockImplementationOnce(() =>
      Promise.reject(new Error("Storage error")),
    );

    const response = await request.get(url);

    expect(response.status).toEqual(500);
  });

  it("It should return a 500 response if retrieving the questionnaire list throws a non-Error", async () => {
    getFilesWithMetadataInBucketMock.mockImplementationOnce(() => {
      throw "non-error string";
    });

    const response = await request.get(url);

    expect(response.status).toEqual(500);
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });
});
