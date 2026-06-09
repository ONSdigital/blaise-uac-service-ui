import "@testing-library/jest-dom/vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { act } from "react";
import { MemoryRouter, useNavigate } from "react-router-dom";

import flushPromises from "../../../test-utils/flushPromises";
import { renderWithQueryClient } from "../../../test-utils/renderWithQueryClient";

import Confirmation from "./confirmation";

import type * as ReactRouterDom from "react-router-dom";
import type { Mock } from "vitest";

vi.mock("blaise-login-react-client", () => ({
  Authenticate: ({
    children,
  }: {
    children: (user: null, loggedIn: boolean, logOutFunction: () => void) => React.ReactNode;
  }) => children(null, true, vi.fn()),
  createSessionKey: vi.fn().mockReturnValue("mock-session-key"),
  AuthManager: class {
    authHeader() {
      return {};
    }
  },
}));

const mock = new MockAdapter(axios);

vi.mock("react-router-dom", async (importOriginal) => {
  const mod = await importOriginal<typeof ReactRouterDom>();

  return {
    ...mod,
    useNavigate: vi.fn(),
  };
});

const uac = "123456789123";

function renderComponent() {
  return renderWithQueryClient(
    <MemoryRouter>
      <Confirmation uac={uac} />
    </MemoryRouter>,
  );
}

describe("Disable Confirmation component loads correctly and receives the passed uac prop", () => {
  it("renders Disable Confirmation Component and shows a warning message for disabling uac", () => {
    const { getByText } = renderComponent();

    expect(getByText(/Are you sure you want to disable UAC/i)).toBeInTheDocument();
    expect(getByText(uac)).toHaveClass("ons-highlight");
  });
});

describe("Disable Confirmation component correctly displays messages when user takes action", () => {
  const navigate: Mock = vi.fn();

  beforeEach(() => {
    mock.reset();
    navigate.mockReset();
    (useNavigate as Mock).mockReturnValue(navigate);
  });

  it("correctly navigates to DisableUac Component when User clicks Continue button and api returns Success", async () => {
    mock.onPost("/api/v1/uac/disable").reply(200, "Success");

    const { getByRole } = renderComponent();

    act(() => {
      fireEvent.click(getByRole("button", { name: "Continue" }));
    });
    await act(async () => {
      await flushPromises();
    });

    expect(navigate).toHaveBeenCalledWith("/disable-uac", {
      state: { disabledUac: uac, responseCode: 200 },
    });
  });

  it("correctly navigates to DisableUac Component when User clicks Continue button and api returns Error", async () => {
    mock.onPost("/api/v1/uac/disable").reply(500, "Disabling UAC failed");

    const { getByRole } = renderComponent();

    act(() => {
      fireEvent.click(getByRole("button", { name: "Continue" }));
    });
    await act(async () => {
      await flushPromises();
    });

    expect(navigate).toHaveBeenCalledWith("/disable-uac", {
      state: { disabledUac: uac, responseCode: 500 },
    });
  });

  it("correctly navigates to DisableUac Component with an error state when the API returns a non-success payload", async () => {
    mock.onPost("/api/v1/uac/disable").reply(200, "Not success");

    const { getByRole } = renderComponent();

    act(() => {
      fireEvent.click(getByRole("button", { name: "Continue" }));
    });
    await act(async () => {
      await flushPromises();
    });

    expect(navigate).toHaveBeenCalledWith("/disable-uac", {
      state: { disabledUac: uac, responseCode: 500 },
    });
  });

  it("correctly navigates back if user clicks Cancel", async () => {
    const { getByRole } = renderComponent();

    act(() => {
      fireEvent.click(getByRole("button", { name: "Cancel" }));
    });
    await act(async () => {
      await flushPromises();
    });

    expect(navigate).toHaveBeenCalledWith(-1);
  });

  it("redirects to login when api returns 401", async () => {
    const assign = vi.fn();

    vi.stubGlobal("location", { assign });

    mock.onPost("/api/v1/uac/disable").reply(401);

    const { getByRole } = renderComponent();

    act(() => {
      fireEvent.click(getByRole("button", { name: "Continue" }));
    });
    await act(async () => {
      await flushPromises();
    });

    expect(assign).toHaveBeenCalledWith("/");
    expect(navigate).not.toHaveBeenCalled();

    vi.unstubAllGlobals();
  });

  it("renders a loading panel while the disable request is pending", async () => {
    mock.onPost("/api/v1/uac/disable").reply(() => new Promise(() => undefined));

    const { getByRole } = renderComponent();

    act(() => {
      fireEvent.click(getByRole("button", { name: "Continue" }));
    });

    await waitFor(() => {
      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });
  });
});
