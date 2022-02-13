import { GetConfigFromEnv } from "./config";

describe("Config setup", () => {
    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    it("should return the correct environment variables", () => {
        const config = GetConfigFromEnv();

        expect(config.ProjectID).toBe("ProjectID-mock");
        expect(config.BucketName).toBe("BucketName-mock");
        expect(config.BusApiUrl).toBe("BusApiUrl-mock");
        expect(config.BusClientId).toBe("BusClientId-mock");
        expect(config.BlaiseApiUrl).toBe("BlaiseApiUrl-mock");
        expect(config.Roles).toStrictEqual(["MockRole1", "MockRole2", "MockRole3"]);
        expect(config.SessionTimeout).toBe("SessionTimeout-mock");
        expect(config.SessionSecret).toBe("SessionSecret-mock");
    });

    it("should return variables with default string if variables are not defined", () => {
        process.env = Object.assign({
            PROJECT_ID: undefined,
            BUCKET_NAME: undefined,
            BUS_API_URL: undefined,
            BUS_CLIENT_ID: undefined,
            BLAISE_API_URL: undefined,
            ROLES: undefined,
            SESSION_TIMEOUT: undefined,
            SESSION_SECRET: undefined

        });

        const config = GetConfigFromEnv();

        expect(config.ProjectID).toBe("ENV_VAR_NOT_SET");
        expect(config.BucketName).toBe("ENV_VAR_NOT_SET");
        expect(config.BusApiUrl).toBe("ENV_VAR_NOT_SET");
        expect(config.BusClientId).toBe("ENV_VAR_NOT_SET");
        expect(config.BlaiseApiUrl).toBe("ENV_VAR_NOT_SET");
        expect(config.Roles).toStrictEqual(["DST", "BDSS"]);
        expect(config.SessionTimeout).toBe("12h");
        expect(config.SessionSecret).toHaveLength(40);
    });
});
