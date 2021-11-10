
import dotenv from "dotenv";
export interface Config {
    ProjectID: string,
    BucketName: string,
    BusApiUrl: string,
    BusClientId: string
}

export function GetConfigFromEnv(): Config {
    if (process.env.NODE_ENV !== "production") {
        dotenv.config({ path: __dirname + "/../.env" });
    }

    let {PROJECT_ID, BUCKET_NAME, BUS_API_URL, BUS_CLIENT_ID} = process.env;

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

    return {
        ProjectID: PROJECT_ID,
        BucketName: BUCKET_NAME,
        BusApiUrl: BUS_API_URL,
        BusClientId: BUS_CLIENT_ID,
    };
}
