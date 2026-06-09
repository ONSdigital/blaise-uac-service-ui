import { getConfigFromEnv } from "./config.js";

const savedEnv = { ...process.env };

describe("Config setup", () => {
  afterEach(() => {
    Object.assign(process.env, savedEnv);
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("should return the correct environment variables", () => {
    const config = getConfigFromEnv();

    expect(config.projectId).toBe("ProjectID-mock");
    expect(config.urlDomain).toBe("UrlDomain-mock");
    expect(config.bucketName).toBe("BucketName-mock");
    expect(config.busUrl).toBe("http://localhost:8080");
    expect(config.busClientId).toBe("BusClientId-mock");
    expect(config.blaiseApiUrl).toBe("http://localhost:8081");
    expect(config.Roles).toStrictEqual(["DST", "BDSS", "Researcher"]);
    expect(config.SessionTimeout).toBe("12h");
    expect(config.SessionSecret).toBe("SessionSecret-mock");
    expect(config.serverPark).toBe("ServerPark-mock");
  });

  it("should throw an error if required environment variables are not defined", () => {
    const savedProcessEnv = process.env;

    process.env = {
      PROJECT_ID: undefined,
      URL_DOMAIN: undefined,
      BUCKET_NAME: undefined,
      BUS_API_URL: undefined,
      BUS_CLIENT_ID: undefined,
      BLAISE_API_URL: undefined,
      SESSION_SECRET: undefined,
      SERVER_PARK: undefined,
    } as NodeJS.ProcessEnv;

    try {
      expect(() => getConfigFromEnv()).toThrow("Missing required environment variables");
    } finally {
      process.env = savedProcessEnv;
    }
  });

  it("should use PORT env variable when set to a valid port", () => {
    process.env.PORT = "3000";

    const config = getConfigFromEnv();

    expect(config.port).toBe(3000);
  });

  it("should throw an error if PORT is not a valid integer", () => {
    process.env.PORT = "not-a-port";

    expect(() => getConfigFromEnv()).toThrow("Invalid PORT value: not-a-port");
  });

  it("should throw an error if PORT is zero or negative", () => {
    process.env.PORT = "0";

    expect(() => getConfigFromEnv()).toThrow("Invalid PORT value: 0");
  });
});
