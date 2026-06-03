import "@testing-library/jest-dom/vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { act } from "react";
import { MemoryRouter, useNavigate } from "react-router-dom";

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

const confirmationComponentState = {
  questionnaireName: "LMS2209_EM1",
  uac: "100461197282",
  case_id: "907195",
};

function renderComponent() {
  return renderWithQueryClient(
    <MemoryRouter>
      <Confirmation {...confirmationComponentState} />
    </MemoryRouter>,
  );
}

describe("Enable UAC Confirmation component", () => {
  it("renders Enable Confirmation Component and receives the passed state", async () => {
    const { getByText } = renderComponent();

    const expectedWarningMessageText = /Are you sure you want to enable UAC/i;

    expect(getByText(expectedWarningMessageText)).toBeInTheDocument();
    expect(getByText(confirmationComponentState.uac)).toBeInTheDocument();
    expect(getByText(confirmationComponentState.case_id)).toBeInTheDocument();
  });
});

describe("Enable UAC Confirmation Component correctly displays messages when user takes action and navigates correctly", () => {
  const navigate: Mock = vi.fn();

  beforeEach(() => {
    mock.reset();
    navigate.mockReset();
  });

  const manageUacPageSuccessState = {
    questionnaireName: "LMS2209_EM1",
    uac: "100461197282",
    case_id: "907195",
    responseStatus: "success",
  };
  const manageUacPageFailedState = {
    questionnaireName: "LMS2209_EM1",
    uac: "100461197282",
    case_id: "907195",
    responseStatus: "error",
  };

  it("renders Enable Confirmation Component and navigates to manageUac Page Component (Enable view) passing new state with success api response status ", async () => {
    (useNavigate as Mock).mockReturnValue(navigate);

    mock.onPost("/api/v1/uac/enable").reply(200, "Success");

    const { getByRole } = renderComponent();

    const continueButton = getByRole("button", { name: "Continue" });

    expect(continueButton).toBeDefined();

    act(() => {
      fireEvent.click(continueButton);
    });

    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith("/enable-uac", { state: manageUacPageSuccessState });
    });
  });

  it("renders Enable Confirmation Component and navigates to manageUac Page Component (Enable view) passing new state with failed api response status ", async () => {
    (useNavigate as Mock).mockReturnValue(navigate);

    mock.onPost("/api/v1/uac/enable").reply(500, "Enabling UAC failed");

    const { getByRole } = renderComponent();

    const continueButton = getByRole("button", { name: "Continue" });

    expect(continueButton).toBeDefined();

    act(() => {
      fireEvent.click(continueButton);
    });

    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith("/enable-uac", { state: manageUacPageFailedState });
    });
  });

  it("renders Enable Confirmation Component and navigates with an error state when the API returns a non-success payload", async () => {
    (useNavigate as Mock).mockReturnValue(navigate);

    mock.onPost("/api/v1/uac/enable").reply(200, "Not success");

    const { getByRole } = renderComponent();

    act(() => {
      fireEvent.click(getByRole("button", { name: "Continue" }));
    });

    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith("/enable-uac", { state: manageUacPageFailedState });
    });
  });

  it("renders Enable Confirmation Component and navigates back if user Clicks Cancel", async () => {
    (useNavigate as Mock).mockReturnValue(navigate);

    const { getByRole } = renderComponent();

    const cancelButton = getByRole("button", { name: "Cancel" });

    expect(cancelButton).toBeDefined();

    act(() => {
      fireEvent.click(cancelButton);
    });

    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith(-1);
    });
  });

  it("redirects to login when api returns 401", async () => {
    (useNavigate as Mock).mockReturnValue(navigate);

    const assign = vi.fn();

    vi.stubGlobal("location", { assign });

    mock.onPost("/api/v1/uac/enable").reply(401);

    const { getByRole } = renderComponent();

    act(() => {
      fireEvent.click(getByRole("button", { name: "Continue" }));
    });

    await waitFor(() => {
      expect(assign).toHaveBeenCalledWith("/");
    });

    expect(navigate).not.toHaveBeenCalled();

    vi.unstubAllGlobals();
  });

  it("renders a loading panel while the enable request is pending", async () => {
    (useNavigate as Mock).mockReturnValue(navigate);

    mock.onPost("/api/v1/uac/enable").reply(() => new Promise(() => undefined));

    const { getByRole } = renderComponent();

    act(() => {
      fireEvent.click(getByRole("button", { name: "Continue" }));
    });

    await waitFor(() => {
      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });
  });
});
