import {getEnvironmentVariables} from "./config";

describe("Config setup", () => {
    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    it("should return the correct environment variables", () => {
        const {PROJECT_ID, BUCKET_NAME, BUS_API_URL, BUS_CLIENT_ID} = getEnvironmentVariables();

        expect(PROJECT_ID).toBe("a-project-name");
        expect(BUCKET_NAME).toBe("unique-bucket");
        expect(BUS_API_URL).toBe("bus-api-url");
        expect(BUS_CLIENT_ID).toBe("bus-client-id");
    });

    it("should return variables with default string if variables are not defined", () => {
        process.env = Object.assign({
            PROJECT_ID: undefined,
            BUCKET_NAME: undefined,
            BUS_API_URL: undefined,
            BUS_CLIENT_ID: undefined
        });

        const {PROJECT_ID, BUCKET_NAME, BUS_API_URL, BUS_CLIENT_ID} = getEnvironmentVariables();

        expect(PROJECT_ID).toBe("ENV_VAR_NOT_SET");
        expect(BUCKET_NAME).toBe("ENV_VAR_NOT_SET");
        expect(BUS_API_URL).toBe("ENV_VAR_NOT_SET");
        expect(BUS_CLIENT_ID).toBe("ENV_VAR_NOT_SET");
    });
});