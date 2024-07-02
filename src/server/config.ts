
import crypto from "crypto";
import dotenv from "dotenv";
import { AuthConfig } from "blaise-login-react/blaise-login-react-server";
export interface Config extends AuthConfig {
    ProjectID: string,
    BucketName: string,
    BusApiUrl: string,
    BusClientId: string,
    BlaiseApiUrl: string
}

export function GetConfigFromEnv(): Config {
    if (process.env.NODE_ENV !== "production") {
        dotenv.config({ path: __dirname + "/../.env" });
    }

    let { PROJECT_ID, BUCKET_NAME, BUS_API_URL, BUS_CLIENT_ID, BLAISE_API_URL, SESSION_TIMEOUT } = process.env;
    const { ROLES, SESSION_SECRET } = process.env;

    if (PROJECT_ID === undefined) {
        console.error("PROJECT_ID environment variable has not been set");
        PROJECT_ID = "ENV_VAR_NOT_SET";
    }

    if (BUCKET_NAME === undefined) {
        console.error("BUCKET_NAME environment variable has not been set");
        BUCKET_NAME = "ENV_VAR_NOT_SET";
    }

    if (BUS_API_URL === undefined) {
        console.error("BUS_API_URL environment variable has not been set");
        BUS_API_URL = "ENV_VAR_NOT_SET";
    }

    if (BUS_CLIENT_ID === undefined) {
        console.error("BUS_CLIENT_ID environment variable has not been set");
        BUS_CLIENT_ID = "ENV_VAR_NOT_SET";
    }

    if (BLAISE_API_URL === undefined) {
        console.error("BLAISE_API_URL environment variable has not been set");
        BLAISE_API_URL = "ENV_VAR_NOT_SET";
    }

    if (SESSION_TIMEOUT === undefined || SESSION_TIMEOUT === "_SESSION_TIMEOUT") {
        console.error("SESSION_TIMEOUT environment variable has not been set");
        SESSION_TIMEOUT = "12h";
    }

    return {
        ProjectID: PROJECT_ID,
        BucketName: BUCKET_NAME,
        BusApiUrl: BUS_API_URL,
        BusClientId: BUS_CLIENT_ID,
        BlaiseApiUrl: BLAISE_API_URL,
        Roles: loadRoles(ROLES),
        SessionTimeout: SESSION_TIMEOUT,
        SessionSecret: sessionSecret(SESSION_SECRET)
    };
}

function loadRoles(roles: string | undefined): string[] {
    if (!roles || roles === "" || roles === "_ROLES") {
        return ["DST", "BDSS", "Researcher"];
    }
    return roles.split(",");
}

function sessionSecret(secret: string | undefined): string {
    if (!secret || secret === "" || secret === "_SESSION_SECRET") {
        return crypto.randomBytes(20).toString("hex");
    }
    return secret;
}
