import { vi } from "vitest";

const appConfigElementId = "app-config";

function removeAppConfig(): void {
  document.getElementById(appConfigElementId)?.remove();
}

function setAppConfig(config: unknown): void {
  const configElement = document.createElement("script");

  configElement.id = appConfigElementId;
  configElement.type = "application/json";
  configElement.textContent = JSON.stringify(config);
  document.body.appendChild(configElement);
}

function setRawAppConfig(rawConfig: string): void {
  const configElement = document.createElement("script");

  configElement.id = appConfigElementId;
  configElement.type = "application/json";
  configElement.textContent = rawConfig;
  document.body.appendChild(configElement);
}

function setDefaultAppConfig(): void {
  if (document.getElementById(appConfigElementId)) {
    return;
  }

  setAppConfig({
    projectId: "test-project-id",
    urlDomain: "test.blaise.gcp.onsdigital.uk",
  });
}

describe("getRuntimeAppConfig", () => {
  beforeEach(() => {
    vi.resetModules();
    removeAppConfig();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    removeAppConfig();
    setDefaultAppConfig();
  });

  it("reads runtime config from injected app config", async () => {
    setAppConfig({ projectId: "shared-project", urlDomain: "blaise.gcp.onsdigital.uk" });

    const { getRuntimeAppConfig } = await import("./auth");

    expect(getRuntimeAppConfig()).toStrictEqual({
      projectId: "shared-project",
      urlDomain: "blaise.gcp.onsdigital.uk",
    });
  });

  it("returns cached config on subsequent calls", async () => {
    setAppConfig({ projectId: "shared-project", urlDomain: "blaise.gcp.onsdigital.uk" });

    const { getRuntimeAppConfig } = await import("./auth");

    const initialConfig = getRuntimeAppConfig();

    removeAppConfig();
    setAppConfig({ projectId: "changed-project", urlDomain: "changed.domain" });

    expect(getRuntimeAppConfig()).toStrictEqual(initialConfig);
  });

  it("falls back to VITE env when app config is missing", async () => {
    removeAppConfig();
    vi.stubEnv("VITE_PROJECT_ID", "vite-project-id");
    vi.stubEnv("VITE_URL_DOMAIN", "vite.blaise.gcp.onsdigital.uk");

    const { getRuntimeAppConfig } = await import("./auth");

    expect(getRuntimeAppConfig()).toStrictEqual({
      projectId: "vite-project-id",
      urlDomain: "vite.blaise.gcp.onsdigital.uk",
    });
  });

  it("throws when app config JSON is invalid", async () => {
    setRawAppConfig("not-json");

    const { getRuntimeAppConfig } = await import("./auth");

    expect(() => getRuntimeAppConfig()).toThrow("Failed to parse runtime app config JSON.");
  });

  it("throws when runtime config is missing", async () => {
    setAppConfig({ projectId: "shared-project" });

    const { getRuntimeAppConfig } = await import("./auth");

    expect(() => getRuntimeAppConfig()).toThrow("Missing runtime config for urlDomain");
  });
});

describe("getSharedAuthOptions", () => {
  beforeEach(() => {
    vi.resetModules();
    removeAppConfig();
  });

  afterEach(() => {
    vi.resetModules();
    vi.doUnmock("blaise-login-react-client");
    vi.unstubAllEnvs();
    removeAppConfig();
    setDefaultAppConfig();
  });

  it("returns shared session key and cookie domain", async () => {
    setAppConfig({ projectId: "shared-project", urlDomain: "blaise.gcp.onsdigital.uk" });

    vi.doMock("blaise-login-react-client", () => ({
      createSessionKey: vi.fn().mockReturnValue("shared-session-key"),
    }));

    const { getSharedAuthOptions } = await import("./auth");

    expect(getSharedAuthOptions()).toStrictEqual({
      sessionKey: "shared-session-key",
      cookieDomain: "blaise.gcp.onsdigital.uk",
    });
  });
});
