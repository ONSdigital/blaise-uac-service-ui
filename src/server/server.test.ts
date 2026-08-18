import fs from "fs";

import { type Auth } from "blaise-login-react-server";
import ejs from "ejs";
import listEndpoints from "express-list-endpoints";
import supertest from "supertest";

import { getConfigFromEnv } from "./config.js";
import { keyGeneratorFromAuthenticatedUser, keyGeneratorFromIp, newServer } from "./server.js";

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

describe("Rate limiter key generator", () => {
  type KeyGeneratorRequest = Parameters<typeof keyGeneratorFromIp>[0];

  it("uses express ip when available", () => {
    const request = {
      headers: {
        forwarded: 'for="198.51.100.27:5151";proto=https, for="203.0.113.9";proto=http',
      },
      ip: "10.0.0.2",
      socket: { remoteAddress: "127.0.0.1" },
    };

    expect(keyGeneratorFromIp(request as KeyGeneratorRequest)).toBe("10.0.0.2");
  });

  it("uses express ip when Forwarded is unavailable", () => {
    const request = {
      headers: {},
      ip: "10.0.0.2",
      socket: { remoteAddress: "127.0.0.1" },
    };

    expect(keyGeneratorFromIp(request as KeyGeneratorRequest)).toBe("10.0.0.2");
  });

  it("falls back to socket remoteAddress when request ip is undefined", () => {
    const request = {
      headers: {},
      socket: { remoteAddress: "127.0.0.1" },
    };

    expect(keyGeneratorFromIp(request as KeyGeneratorRequest)).toBe("127.0.0.1");
  });

  it("supports IPv6 values from request ip", () => {
    const request = {
      headers: {},
      ip: "2001:db8:cafe::17",
      socket: { remoteAddress: "127.0.0.1" },
    };

    expect(keyGeneratorFromIp(request as KeyGeneratorRequest)).toBe("2001:db8:cafe::/56");
  });

  it("ignores spoofed forwarded header values", () => {
    const request = {
      headers: { forwarded: "for=198.51.100.50;proto=https" },
      ip: "10.0.0.2",
      socket: { remoteAddress: "127.0.0.1" },
    };

    expect(keyGeneratorFromIp(request as KeyGeneratorRequest)).toBe("10.0.0.2");
  });

  it("uses unknown when no header, request ip or socket address are available", () => {
    const request = {
      headers: {},
      socket: {},
    };

    expect(keyGeneratorFromIp(request as KeyGeneratorRequest)).toBe("unknown");
  });
});

describe("Rate limiter authenticated key generator", () => {
  type KeyGeneratorRequest = Parameters<typeof keyGeneratorFromIp>[0];

  it("uses the authenticated username when available", () => {
    const auth = {
      getToken: vi.fn().mockReturnValue("token"),
      getUser: vi.fn().mockReturnValue({ name: "Rich User" }),
    } as unknown as Auth;
    const request = {
      headers: {},
      ip: "10.0.0.2",
      socket: { remoteAddress: "127.0.0.1" },
    };

    expect(keyGeneratorFromAuthenticatedUser(auth, request as KeyGeneratorRequest)).toBe(
      "user:rich%20user",
    );
  });

  it("falls back to IP identity when username is unavailable", () => {
    const auth = {
      getToken: vi.fn().mockReturnValue("token"),
      getUser: vi.fn().mockReturnValue({}),
    } as unknown as Auth;
    const request = {
      headers: { forwarded: "for=198.51.100.50;proto=https" },
      ip: "10.0.0.2",
      socket: { remoteAddress: "127.0.0.1" },
    };

    expect(keyGeneratorFromAuthenticatedUser(auth, request as KeyGeneratorRequest)).toBe(
      "10.0.0.2",
    );
  });

  it("falls back to IP identity when auth access throws", () => {
    const auth = {
      getToken: vi.fn().mockImplementation(() => {
        throw new Error("token error");
      }),
      getUser: vi.fn(),
    } as unknown as Auth;
    const request = {
      headers: { forwarded: "for=198.51.100.50;proto=https" },
      ip: "10.0.0.2",
      socket: { remoteAddress: "127.0.0.1" },
    };

    expect(keyGeneratorFromAuthenticatedUser(auth, request as KeyGeneratorRequest)).toBe(
      "10.0.0.2",
    );
  });

  it("falls back to IP identity when username is blank", () => {
    const auth = {
      getToken: vi.fn().mockReturnValue("token"),
      getUser: vi.fn().mockReturnValue({ name: "   " }),
    } as unknown as Auth;
    const request = {
      headers: { forwarded: "for=198.51.100.50;proto=https" },
      ip: "10.0.0.2",
      socket: { remoteAddress: "127.0.0.1" },
    };

    expect(keyGeneratorFromAuthenticatedUser(auth, request as KeyGeneratorRequest)).toBe(
      "10.0.0.2",
    );
  });
});

describe("Rate limiter configuration", () => {
  const config = getConfigFromEnv();
  const originalApiRateLimit = process.env.BUS_API_RATE_LIMIT;

  afterEach(() => {
    process.env.BUS_API_RATE_LIMIT = originalApiRateLimit;
  });

  it("falls back to default API limit when BUS_API_RATE_LIMIT is invalid", async () => {
    process.env.BUS_API_RATE_LIMIT = "invalid";

    const response = await supertest(newServer(config)).post("/api/v1/not-found");
    const rateLimitHeader = String(
      response.headers.ratelimit ?? response.headers["ratelimit-policy"] ?? "",
    );

    expect(response.status).toBe(404);
    expect(rateLimitHeader).toContain("3000");
  });

  it("uses BUS_API_RATE_LIMIT when it is a valid integer", async () => {
    process.env.BUS_API_RATE_LIMIT = "7";

    const response = await supertest(newServer(config)).post("/api/v1/not-found");
    const rateLimitHeader = String(
      response.headers.ratelimit ?? response.headers["ratelimit-policy"] ?? "",
    );

    expect(response.status).toBe(404);
    expect(rateLimitHeader).toContain("7");
  });
});

describe("Server hardening headers", () => {
  it("applies baseline HTTP hardening headers", async () => {
    const config = getConfigFromEnv();
    const response = await supertest(newServer(config)).get("/bus-ui/version/health");

    expect(response.status).toBe(200);
    expect(response.headers["x-powered-by"]).toBeUndefined();
    expect(response.headers["x-content-type-options"]).toBe("nosniff");
  });
});
