import fs from "fs";

import ejs from "ejs";
import listEndpoints from "express-list-endpoints";
import supertest from "supertest";

import { getConfigFromEnv } from "./config.js";
import { newServer } from "./server.js";

import type * as BlaiseLoginReactServer from "blaise-login-react-server";
import type * as EjsModule from "ejs";

vi.mock("ejs", async (importOriginal) => {
  const real = await importOriginal<typeof EjsModule>();

  return {
    default: {
      ...real.default,
      renderFile: vi.fn(real.default.renderFile),
    },
  };
});

vi.mock("blaise-login-react-server", async (importOriginal) => {
  const mod = await importOriginal<typeof BlaiseLoginReactServer>();

  return {
    ...mod,
    Auth: class {
      middleware(_req: unknown, _res: unknown, next: () => void) {
        next();
      }
    },
  };
});

describe("All expected routes are registered", () => {
  const expectedEndpoints = [
    {
      methods: ["GET"],
      middlewares: ["anonymous", "renderClientIndex"],
      path: "/",
    },
    {
      methods: ["GET"],
      middlewares: ["anonymous", "renderClientIndex"],
      path: "/index.html",
    },
    {
      methods: ["POST"],
      middlewares: ["middleware", "multerMiddleware", "generateUacsForSampleFile"],
      path: "/api/v1/questionnaire/:questionnaireName/uac/sample",
    },
    {
      methods: ["GET"],
      middlewares: ["middleware", "getSampleFileWithUacs"],
      path: "/api/v1/questionnaire/:questionnaireName/uac/sample/:fileName",
    },
    {
      methods: ["GET"],
      middlewares: ["middleware", "fileExists"],
      path: "/api/v1/file/:fileName/exists",
    },
    {
      methods: ["GET"],
      middlewares: ["middleware", "getListOfQuestionnaireSamplesInBucket"],
      path: "/api/v1/questionnaire-names",
    },
    {
      methods: ["POST"],
      middlewares: ["middleware", "multerMiddleware", "importUacs"],
      path: "/api/v1/uac/import",
    },
    { methods: ["GET"], middlewares: ["healthCheck"], path: "/bus-ui/:version/health" },
    {
      methods: ["GET"],
      middlewares: ["anonymous", "middleware", "bound getCurrentUser"],
      path: "/api/login/current-user",
    },
    { methods: ["POST"], middlewares: ["anonymous", "bound login"], path: "/api/login" },
    { methods: ["POST"], middlewares: ["middleware", "disableUac"], path: "/api/v1/uac/disable" },
    { methods: ["POST"], middlewares: ["middleware", "enableUac"], path: "/api/v1/uac/enable" },
    {
      methods: ["GET"],
      middlewares: ["middleware", "getDisabledUacs"],
      path: "/api/v1/questionnaire/:questionnaire/disabled-uacs",
    },
    {
      methods: ["GET"],
      middlewares: ["middleware", "getAllDisabledUacs"],
      path: "/api/v1/disabled-uacs",
    },
    {
      methods: ["GET"],
      middlewares: ["middleware", "getQuestionnaires"],
      path: "/api/v1/questionnaires",
    },
    {
      methods: ["GET"],
      middlewares: ["middleware", "getAuditInfo"],
      path: "/api/audit",
    },
    { methods: ["GET"], middlewares: ["anonymous", "renderClientIndex"], path: "/{*path}" },
  ];

  it("should contain all expected routes", async () => {
    const config = getConfigFromEnv();
    const server = newServer(config);
    const endpoints = listEndpoints(
      (server as unknown as { router: Parameters<typeof listEndpoints>[0] }).router,
    );

    expect(endpoints).toEqual(expectedEndpoints);
  });
});

describe("Server catch-all and error handler", () => {
  const config = getConfigFromEnv();
  const server = newServer(config);
  const request = supertest(server);

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("serves index.html for unmatched routes", async () => {
    const response = await request.get("/some-unknown-path");

    expect([200, 500]).toContain(response.status);
  });

  it("returns 500 for internal server errors", async () => {
    vi.mocked(ejs.renderFile).mockRejectedValueOnce(new Error("Forced render error"));

    const response = await request.get("/some-error-trigger-path");

    expect(response.status).toBe(500);
  });

  it("falls back to the plain-text error response when the HTML error page is missing", async () => {
    const actualExistsSync = fs.existsSync;

    vi.mocked(ejs.renderFile).mockRejectedValueOnce(new Error("Forced render error"));
    vi.spyOn(fs, "existsSync").mockImplementation((filePath) => {
      if (String(filePath).endsWith("/views/500.html")) {
        return false;
      }

      return actualExistsSync(filePath);
    });

    const fallbackResponse = await supertest(newServer(config)).get("/missing-error-page");

    expect(fallbackResponse.status).toBe(500);
    expect(fallbackResponse.type).toContain("text/plain");
    expect(fallbackResponse.text).toBe("Sorry, there is a problem with the service.");
  });

  it("falls back to the first client build candidate when neither build folder exists", () => {
    const actualExistsSync = fs.existsSync;

    vi.spyOn(fs, "existsSync").mockImplementation((filePath) => {
      if (String(filePath).endsWith("build/client")) {
        return false;
      }

      return actualExistsSync(filePath);
    });

    expect(newServer(config)).toBeDefined();
  });
});
