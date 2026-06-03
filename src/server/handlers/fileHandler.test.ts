import { Auth } from "blaise-login-react-server";
import supertest, { type Response } from "supertest";

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
const fileExistsInBucketMock = vi.fn();

GoogleStorage.prototype.fileExistsInBucket = fileExistsInBucketMock;

const config = getConfigFromEnv();

const fileName = "DST2101A.csv";

const server = newServer(config);
const request = supertest(server);

describe("file-exists-handler tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("It should be called with canonical uppercase filename first", async () => {
    fileExistsInBucketMock.mockImplementationOnce(() => {
      return Promise.resolve(true);
    });

    const response: Response = await request.get(`/api/v1/file/${fileName}/exists`);

    expect(response.status).toEqual(200);

    expect(fileExistsInBucketMock).toHaveBeenCalledWith("BucketName-mock", fileName);
    expect(fileExistsInBucketMock).toHaveBeenCalledTimes(1);
  });

  it("It should check lowercase filename when uppercase file does not exist", async () => {
    fileExistsInBucketMock.mockResolvedValueOnce(false).mockResolvedValueOnce(true);

    const response: Response = await request.get(`/api/v1/file/${fileName.toLowerCase()}/exists`);

    expect(response.status).toEqual(200);
    expect(fileExistsInBucketMock).toHaveBeenNthCalledWith(1, "BucketName-mock", fileName);
    expect(fileExistsInBucketMock).toHaveBeenNthCalledWith(
      2,
      "BucketName-mock",
      fileName.toLowerCase(),
    );
  });

  it("It should return a 400 response for an invalid filename", async () => {
    const response: Response = await request.get("/api/v1/file/notafile.txt/exists");

    expect(response.status).toEqual(400);
    expect(fileExistsInBucketMock).not.toHaveBeenCalled();
  });

  it("It should return a 200 response with true if the file exists", async () => {
    fileExistsInBucketMock.mockImplementationOnce(() => {
      return Promise.resolve(true);
    });

    const response: Response = await request.get(`/api/v1/file/${fileName}/exists`);

    expect(response.status).toEqual(200);
    expect(response.body).toEqual(true);
  });

  it("It should return a 200 response with false if the file does not exist", async () => {
    fileExistsInBucketMock.mockResolvedValueOnce(false).mockResolvedValueOnce(false);

    const response: Response = await request.get(`/api/v1/file/${fileName}/exists`);

    expect(response.status).toEqual(200);
    expect(response.body).toEqual(false);
  });

  it("It should return a 500 response if checking file existence fails", async () => {
    fileExistsInBucketMock.mockImplementationOnce(() => {
      return Promise.reject(new Error("Storage error"));
    });

    const response: Response = await request.get(`/api/v1/file/${fileName}/exists`);

    expect(response.status).toEqual(500);
    expect(response.body).toEqual("Checking file existence failed");
  });

  it("It should return a 500 response if checking file existence fails with a non-Error object", async () => {
    fileExistsInBucketMock.mockImplementationOnce(() => {
      return Promise.reject("non-error string");
    });

    const response: Response = await request.get(`/api/v1/file/${fileName}/exists`);

    expect(response.status).toEqual(500);
    expect(response.body).toEqual("Checking file existence failed");
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });
});
