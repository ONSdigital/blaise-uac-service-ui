import { GetConfigFromEnv } from "./config";

describe("Config setup", () => {
    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    it("should return the correct environment variables", () => {
        const config = GetConfigFromEnv();

        expect(config.ProjectID).toBe("a-project-name");
        expect(config.BucketName).toBe("unique-bucket");
        expect(config.BusApiUrl).toBe("bus-api-url");
        expect(config.BusClientId).toBe("bus-client-id");
    });

    it("should return variables with default string if variables are not defined", () => {
        process.env = Object.assign({
            PROJECT_ID: undefined,
            BUCKET_NAME: undefined,
            BUS_API_URL: undefined,
            BUS_CLIENT_ID: undefined
        });

        const config = GetConfigFromEnv();

        expect(config.ProjectID).toBe("ENV_VAR_NOT_SET");
        expect(config.BucketName).toBe("ENV_VAR_NOT_SET");
        expect(config.BusApiUrl).toBe("ENV_VAR_NOT_SET");
        expect(config.BusClientId).toBe("ENV_VAR_NOT_SET");
    });
});
