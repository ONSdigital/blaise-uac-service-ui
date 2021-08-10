import express, {Request, Response, Router} from "express";

export default function HealthCheckHandler(): Router {
    const router = express.Router();

    router.get("/uac-ui/:version/health", async function (req: Request, res: Response) {
        console.log("Heath Check endpoint called");
        res.status(200).json({healthy: true});
    });

    return router;
}