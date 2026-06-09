import express from "express";
import supertest from "supertest";

import createAuditHandler from "./auditHandler.js";

const auth = {
  middleware: (_req: unknown, _res: unknown, next: () => void) => next(),
};

function createApp(auditLogger: { getLogs: () => Promise<unknown> }) {
  const app = express();

  app.use((req, _res, next) => {
    Object.assign(req, { log: { error: vi.fn(), info: vi.fn(), warn: vi.fn() } });
    next();
  });

  app.use("/", createAuditHandler(auditLogger as never, auth as never));

  return app;
}

describe("audit handler", () => {
  it("returns audit logs", async () => {
    const auditLogger = {
      getLogs: vi.fn().mockResolvedValue([{ id: "1", message: "entry" }]),
    };

    const response = await supertest(createApp(auditLogger)).get("/api/audit");

    expect(response.status).toBe(200);
    expect(response.body).toStrictEqual([{ id: "1", message: "entry" }]);
  });

  it("returns a 500 when retrieving logs fails", async () => {
    const auditLogger = {
      getLogs: vi.fn().mockRejectedValue(new Error("failed")),
    };

    const response = await supertest(createApp(auditLogger)).get("/api/audit");

    expect(response.status).toBe(500);
    expect(response.body).toStrictEqual({ message: "Failed to retrieve audit logs" });
  });
});
