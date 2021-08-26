export interface EnvironmentVariables {
    PROJECT_ID: string,
    BUCKET_NAME: string,
    BUS_API_URL: string,
    BUS_CLIENT_ID: string
}

export function getEnvironmentVariables(): EnvironmentVariables {
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

    return { PROJECT_ID, BUCKET_NAME, BUS_API_URL, BUS_CLIENT_ID};
}