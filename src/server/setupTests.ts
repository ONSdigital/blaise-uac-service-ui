import { vi } from "vitest";

(global as Record<string, unknown>).jest = vi;

process.env.PROJECT_ID = "ProjectID-mock";
process.env.URL_DOMAIN = "UrlDomain-mock";
process.env.BUCKET_NAME = "BucketName-mock";
process.env.SERVER_PARK = "ServerPark-mock";
process.env.BUS_API_URL = "http://localhost:8080";
process.env.BUS_CLIENT_ID = "BusClientId-mock";
process.env.BLAISE_API_URL = "http://localhost:8081";
process.env.SESSION_SECRET = "SessionSecret-mock";
process.env.NODE_ENV = "test";
