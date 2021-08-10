export interface EnvironmentVariables {
    PROJECT_ID: string,
    BUCKET_NAME: string
}

export function getEnvironmentVariables(): EnvironmentVariables {
    let {PROJECT_ID, BUCKET_NAME} = process.env;

    if (PROJECT_ID === undefined) {
        console.error("PROJECT_ID environment variable has not been set");
        PROJECT_ID = "ENV_VAR_NOT_SET";
    }

    if (BUCKET_NAME === undefined) {
        console.error("BUCKET_NAME environment variable has not been set");
        BUCKET_NAME = "ENV_VAR_NOT_SET";
    }

    return { PROJECT_ID, BUCKET_NAME};
}