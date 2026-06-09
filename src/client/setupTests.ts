import "@testing-library/jest-dom/vitest";
import { configure } from "@testing-library/react";
import axios, { type AxiosAdapter, AxiosHeaders } from "axios";

const globalWithActEnvironment = globalThis as typeof globalThis & {
  IS_REACT_ACT_ENVIRONMENT?: boolean;
};

globalWithActEnvironment.IS_REACT_ACT_ENVIRONMENT = true;

configure({ asyncUtilTimeout: 5000 });

const appConfigElementId = "app-config";

if (!document.getElementById(appConfigElementId)) {
  const configElement = document.createElement("script");

  configElement.id = appConfigElementId;
  configElement.type = "application/json";
  configElement.textContent = JSON.stringify({
    projectId: "test-project-id",
    urlDomain: "test.blaise.gcp.onsdigital.uk",
  });
  document.body.appendChild(configElement);
}

const testAdapter: AxiosAdapter = async (config) => {
  const method = (config.method ?? "GET").toUpperCase();
  const url = config.url ?? "<unknown-url>";

  const message = `Unmocked HTTP request in tests: ${method} ${url}. Add a test mock for this request.`;

  console.error(message);
  throw Object.assign(new Error(message), {
    response: { status: 500, data: {}, headers: new AxiosHeaders(), config },
    isAxiosError: true,
    config,
  });
};

axios.defaults.adapter = testAdapter;
