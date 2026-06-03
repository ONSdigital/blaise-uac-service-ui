import "@testing-library/jest-dom/vitest";
import { screen } from "@testing-library/react";
import { BrowserRouter, useLocation } from "react-router-dom";

import { renderWithQueryClient } from "../../test-utils/renderWithQueryClient";

import DisableUac from "./disableUacPage";

import type * as ReactRouterDom from "react-router-dom";
import type { Mock } from "vitest";

vi.mock("react-router-dom", async (importOriginal) => {
  const mod = await importOriginal<typeof ReactRouterDom>();

  return {
    ...mod,
    useLocation: vi.fn().mockReturnValue({ state: { disabledUac: "", responseCode: 0 } }),
    useNavigate: vi.fn().mockReturnValue(vi.fn()),
  };
});

describe("Disable Page", () => {
  it("renders the Disable UAC button and input", () => {
    renderWithQueryClient(
      <BrowserRouter>
        <DisableUac />
      </BrowserRouter>,
    );

    expect(screen.getByRole("button", { name: "Disable UAC" })).toBeDefined();
    expect(screen.getByPlaceholderText("Enter 12-digit UAC")).toBeDefined();
  });

  it("renders the DisableUacConfirmation when step is confirmation", () => {
    (useLocation as Mock).mockReturnValueOnce({
      state: { step: "confirmation", uac: "123456789012" },
    });

    renderWithQueryClient(
      <BrowserRouter>
        <DisableUac />
      </BrowserRouter>,
    );

    expect(screen.getByText(/Are you sure you want to disable UAC/i)).toBeInTheDocument();
  });

  it("renders with null state (no previous navigation state)", () => {
    (useLocation as Mock).mockReturnValueOnce({ state: null });

    renderWithQueryClient(
      <BrowserRouter>
        <DisableUac />
      </BrowserRouter>,
    );

    expect(screen.getByRole("button", { name: "Disable UAC" })).toBeDefined();
  });

  it("renders the result panel when the route state contains a disable result", () => {
    (useLocation as Mock).mockReturnValueOnce({
      state: { disabledUac: "123456789012", responseCode: 200 },
    });

    renderWithQueryClient(
      <BrowserRouter>
        <DisableUac />
      </BrowserRouter>,
    );

    expect(screen.getByText("UAC 123456789012 has been disabled")).toBeInTheDocument();
  });

  it("renders an error panel when route state is malformed", () => {
    (useLocation as Mock).mockReturnValueOnce({
      state: { step: "confirmation" },
    });

    renderWithQueryClient(
      <BrowserRouter>
        <DisableUac />
      </BrowserRouter>,
    );

    expect(
      screen.getByText(/The requested disable-UAC screen state was invalid/i),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Disable UAC" })).toBeDefined();
  });
});
