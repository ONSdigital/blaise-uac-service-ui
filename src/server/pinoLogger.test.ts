import { createServer } from "node:http";

import supertest from "supertest";

import createLogger from "./pinoLogger.js";

describe("createLogger", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns a pino-http logger in non-production mode", () => {
    const logger = createLogger();

    expect(logger).toBeDefined();
    expect(typeof logger).toBe("function");
  });

  it("returns a pino-http logger with custom options in non-production mode", () => {
    const logger = createLogger({ autoLogging: true });

    expect(logger).toBeDefined();
    expect(typeof logger).toBe("function");
  });

  it("returns a pino-http logger with production config in production mode", () => {
    vi.stubEnv("NODE_ENV", "production");

    const logger = createLogger();

    expect(logger).toBeDefined();
    expect(typeof logger).toBe("function");
  });

  it("calls the log formatter in production mode", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const logger = createLogger({ autoLogging: true });
    const server = createServer((req, res) => {
      logger(req, res, () => {
        (req as unknown as { log: { info: (obj: unknown, msg?: string) => void } }).log.info(
          { someKey: "value" },
          "test message",
        );
        res.end("ok");
      });
    });
    const response = await supertest(server).get("/");

    expect(response.status).toBe(200);
  });

  it("calls the req serializer in production mode with and without raw user", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const logger = createLogger({ autoLogging: true });
    const server = createServer((req, res) => {
      logger(req, res, () => {
        (req as unknown as { log: { info: (obj: unknown, msg?: string) => void } }).log.info(
          { req },
          "test with req serializer",
        );
        res.end("ok");
      });
    });
    const response = await supertest(server).get("/");

    expect(response.status).toBe(200);
  });

  it("uses fallback severity when level label is unknown", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const logger = createLogger({ autoLogging: true });
    const server = createServer((req, res) => {
      logger(req, res, () => {
        (req as unknown as { log: { info: (obj: unknown) => void } }).log.info({
          level: 99,
          msg: "test unknown level",
        });
        res.end("ok");
      });
    });
    const response = await supertest(server).get("/");

    expect(response.status).toBe(200);
  });
});

describe("createLogger production configuration", () => {
  afterEach(() => {
    vi.doUnmock("pino-http");
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it("falls back to INFO severity for unknown pino levels", async () => {
    vi.resetModules();
    const pinoHttp = vi.fn((options) => options);

    vi.doMock("pino-http", () => ({ pinoHttp }));
    vi.stubEnv("NODE_ENV", "production");

    const { default: createLogger } = await import("./pinoLogger.js");

    createLogger();

    expect(pinoHttp).toHaveBeenCalled();

    const options = pinoHttp.mock.calls[0][0] as {
      formatters: { level: (label: string, number: number) => { severity: string; level: number } };
    };

    expect(options.formatters.level("mystery", 99)).toEqual({ severity: "INFO", level: 99 });
  });
});
