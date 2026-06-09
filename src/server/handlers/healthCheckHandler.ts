import express, { type Request, type Response, type Router } from "express";

export default function createHealthCheckHandler(): Router {
  const router = express.Router();

  return router.get("/bus-ui/:version/health", healthCheck);
}

function healthCheck(_req: Request, res: Response): Response {
  return res.status(200).json({ healthy: true });
}
