import { type Auth } from "blaise-login-react-server";
import express, { type Request, type Response, type Router } from "express";

import type AuditLogger from "../auditLogger.js";

export default function createAuditHandler(auditLogger: AuditLogger, auth: Auth): Router {
  const router = express.Router();
  const auditHandler = new AuditHandler(auditLogger);

  return router.get("/api/audit", auth.middleware, auditHandler.getAuditInfo);
}

class AuditHandler {
  constructor(private readonly auditLogger: AuditLogger) {}

  getAuditInfo = async (req: Request, res: Response): Promise<Response> => {
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.set("Pragma", "no-cache");
    res.set("Expires", "0");
    res.set("Surrogate-Control", "no-store");

    try {
      const logs = await this.auditLogger.getLogs();

      req.log.info("Retrieved audit logs");

      return res.status(200).json(logs);
    } catch (error: unknown) {
      req.log.error(error, "Failed calling getAuditLogs");

      return res.status(500).json({ message: "Failed to retrieve audit logs" });
    }
  };
}
