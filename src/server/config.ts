import type { AuthConfig } from "blaise-login-react-server";

const DEFAULT_SESSION_TIMEOUT = "12h";
const ALLOWED_ROLES = ["DST", "BDSS", "Researcher"];

export interface Config extends AuthConfig {
  port: number;
  projectId: string;
  urlDomain: string;
  bucketName: string;
  serverPark: string;
  busUrl: string;
  busClientId: string;
  blaiseApiUrl: string;
}

type RequiredConfigEnv = {
  PROJECT_ID: string | undefined;
  URL_DOMAIN: string | undefined;
  BUCKET_NAME: string | undefined;
  SERVER_PARK: string | undefined;
  BUS_API_URL: string | undefined;
  BUS_CLIENT_ID: string | undefined;
  BLAISE_API_URL: string | undefined;
  SESSION_SECRET: string | undefined;
};

type ResolvedRequiredConfigEnv = {
  [TKey in keyof RequiredConfigEnv]: string;
};

export function getConfigFromEnv(): Config {
  const {
    PROJECT_ID,
    URL_DOMAIN,
    BUCKET_NAME,
    SERVER_PARK,
    BUS_API_URL,
    BUS_CLIENT_ID,
    BLAISE_API_URL,
    SESSION_SECRET,
    PORT,
  } = process.env;

  const requiredEnv: RequiredConfigEnv = {
    PROJECT_ID,
    URL_DOMAIN,
    BUCKET_NAME,
    SERVER_PARK,
    BUS_API_URL,
    BUS_CLIENT_ID,
    BLAISE_API_URL,
    SESSION_SECRET,
  };

  assertResolvedRequiredEnv(requiredEnv);

  return {
    port: parsePort(PORT),
    projectId: requiredEnv.PROJECT_ID,
    urlDomain: requiredEnv.URL_DOMAIN,
    bucketName: requiredEnv.BUCKET_NAME,
    serverPark: requiredEnv.SERVER_PARK,
    busUrl: requiredEnv.BUS_API_URL,
    busClientId: requiredEnv.BUS_CLIENT_ID,
    blaiseApiUrl: requiredEnv.BLAISE_API_URL,
    SessionTimeout: DEFAULT_SESSION_TIMEOUT,
    SessionSecret: requiredEnv.SESSION_SECRET,
    TokenIssuer: requiredEnv.PROJECT_ID,
    Roles: ALLOWED_ROLES,
  };
}

function assertResolvedRequiredEnv(
  env: RequiredConfigEnv,
): asserts env is ResolvedRequiredConfigEnv {
  const requiredEnvErrors = Object.entries(env)
    .map(([name, value]) => {
      if (value === undefined || value.trim() === "" || value === `_${name}`) {
        return name;
      }

      return undefined;
    })
    .filter((errorMessage): errorMessage is string => errorMessage !== undefined);

  if (requiredEnvErrors.length > 0) {
    throw new Error(`Missing required environment variables: ${requiredEnvErrors.join(", ")}`);
  }
}

function parsePort(port: string | undefined): number {
  if (port === undefined) {
    return 5000;
  }

  const parsed = Number(port);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`Invalid PORT value: ${port}`);
  }

  return parsed;
}
