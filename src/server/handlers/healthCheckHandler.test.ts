import supertest from "supertest";

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

const config = getConfigFromEnv();
const server = newServer(config);
const request = supertest(server);

describe("Test Heath Endpoint", () => {
  it("should return a 200 status and json message", async () => {
    const response = await request.get("/bus-ui/version/health");

    expect(response.statusCode).toEqual(200);
    expect(response.body).toStrictEqual({ healthy: true });
  });
});
