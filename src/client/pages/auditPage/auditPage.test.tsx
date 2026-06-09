import "@testing-library/jest-dom/vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { MemoryRouter } from "react-router-dom";

import { renderWithQueryClient } from "../../test-utils/renderWithQueryClient";

import AuditPage from "./auditPage";

const mock = new MockAdapter(axios, { onNoMatch: "throwException" });

describe("AuditPage", () => {
  afterEach(() => {
    mock.reset();
  });

  it("renders logs with severity status styles", async () => {
    mock.onGet("/api/audit").reply(200, [
      {
        id: "1",
        timestamp: "2026-06-04T12:30:25.000Z",
        message: "jane uploaded sample file sample.csv",
        severity: "INFO",
      },
      {
        id: "2",
        timestamp: "2026-06-04T12:32:10.000Z",
        message: "jane failed to disable UAC 123456789123",
        severity: "ERROR",
      },
    ]);

    renderWithQueryClient(
      <MemoryRouter>
        <AuditPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("UAC history")).toBeInTheDocument();
      expect(screen.getByText("jane uploaded sample file sample.csv")).toHaveClass(
        "ons-status",
        "ons-status--info",
      );
      expect(screen.getByText("jane failed to disable UAC 123456789123")).toHaveClass(
        "ons-status",
        "ons-status--error",
      );
    });
  });

  it("reloads logs when Reload is clicked", async () => {
    mock.onGet("/api/audit").replyOnce(200, [
      {
        id: "1",
        timestamp: "2026-06-04T12:30:25.000Z",
        message: "first message",
        severity: "INFO",
      },
    ]);

    renderWithQueryClient(
      <MemoryRouter>
        <AuditPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("first message")).toBeInTheDocument();
    });

    mock.onGet("/api/audit").replyOnce(200, [
      {
        id: "2",
        timestamp: "not-a-date",
        message: "second message",
        severity: "INFO",
      },
    ]);

    fireEvent.click(screen.getByText("Reload"));

    await waitFor(() => {
      expect(screen.getByText("second message")).toBeInTheDocument();
      expect(screen.getByText("not-a-date")).toBeInTheDocument();
    });
  });

  it("shows error panel when logs cannot be loaded", async () => {
    mock.onGet("/api/audit").reply(500, {});

    renderWithQueryClient(
      <MemoryRouter>
        <AuditPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("Unable to load UAC history.")).toBeInTheDocument();
    });
  });

  it("shows empty-state panel when no logs are returned", async () => {
    mock.onGet("/api/audit").reply(200, []);

    renderWithQueryClient(
      <MemoryRouter>
        <AuditPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("No recent UAC history found.")).toBeInTheDocument();
    });
  });
});
