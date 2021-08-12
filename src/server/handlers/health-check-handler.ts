import express, {Request, Response, Router} from "express";

export default function HealthCheckHandler(): Router {
    const router = express.Router();

    return router.get("/uac-ui/:version/health", healthCheck);
}

export async function healthCheck(req: Request, res: Response): Promise<Response> {
    return res.status(200).json({healthy: true});
}