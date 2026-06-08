import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { act } from "react";
import { MemoryRouter, useNavigate } from "react-router-dom";

import flushPromises from "../../../test-utils/flushPromises";

import Form from "./form";

import type { DisableUacResultState } from "../../../utils/uacRouteState";
import type * as ReactRouterDom from "react-router-dom";
import type { Mock } from "vitest";

vi.mock("axios");

vi.mock("react-router-dom", async (importOriginal) => {
  const mod = await importOriginal<typeof ReactRouterDom>();

  return {
    ...mod,
    useNavigate: vi.fn(),
  };
});

vi.mock("blaise-login-react-client", () => ({
  Authenticate: ({
    children,
  }: {
    children: (user: null, loggedIn: boolean, logOutFunction: () => void) => React.ReactNode;
  }) => children(null, true, vi.fn()),
  createSessionKey: vi.fn().mockReturnValue("mock-session-key"),
}));

let navigate: Mock;

describe("Disable UAC page works as expected", async () => {
  beforeEach(() => {
    navigate = vi.fn();
  });

  it("displays the correct content on landing in Disable UAC view", async () => {
    const { getByText } = render(
      <MemoryRouter>
        <Form />
      </MemoryRouter>,
    );

    await act(async () => {
      await flushPromises();
    });

    expect(getByText("Disable UAC")).toBeDefined();
    expect(screen.getByPlaceholderText("Enter 12-digit UAC")).toBeDefined();
  });

  it("disable UAC button is disabled by default", async () => {
    const { getByRole } = render(
      <MemoryRouter>
        <Form />
      </MemoryRouter>,
    );

    await act(async () => {
      await flushPromises();
    });

    const button = getByRole("button", { name: "Disable UAC" });

    expect(button).toBeDisabled();
  });

  it("disable UAC button is enabled if text field is 12 digits long", async () => {
    const { getByRole } = render(
      <MemoryRouter>
        <Form />
      </MemoryRouter>,
    );

    await act(async () => {
      await flushPromises();
    });
    const disableUacButton = getByRole("button", { name: "Disable UAC" });

    expect(disableUacButton).toBeDisabled();

    const uacInput = screen.getByPlaceholderText("Enter 12-digit UAC");

    fireEvent.change(uacInput, { target: { value: "123456789123" } });

    expect(disableUacButton).toBeEnabled();
  });

  it("disable UAC button remains disabled if text field is not 12 digits long", async () => {
    const { getByRole } = render(
      <MemoryRouter>
        <Form />
      </MemoryRouter>,
    );

    await act(async () => {
      await flushPromises();
    });
    const disableUacButton = getByRole("button", { name: "Disable UAC" });

    expect(disableUacButton).toBeDisabled();

    const uacInput = screen.getByPlaceholderText("Enter 12-digit UAC");

    fireEvent.change(uacInput, { target: { value: "12345678912" } });

    expect(disableUacButton).toBeDisabled();
  });

  it("disable UAC button remains disabled if text field contains alphabets", async () => {
    const { getByRole } = render(
      <MemoryRouter>
        <Form />
      </MemoryRouter>,
    );

    await act(async () => {
      await flushPromises();
    });

    const disableUacButton = getByRole("button", { name: "Disable UAC" });

    expect(disableUacButton).toBeDisabled();

    const uacInput = screen.getByPlaceholderText("Enter 12-digit UAC");

    fireEvent.change(uacInput, { target: { value: "12345678912a" } });

    expect(disableUacButton).toBeDisabled();
  });

  it("correctly shows the message to the user if length of uac exceeds and keeps the button disabled", async () => {
    const { getByText, getByRole } = render(
      <MemoryRouter>
        <Form />
      </MemoryRouter>,
    );

    await act(async () => {
      await flushPromises();
    });

    const invalid_uac = "1234567891234";
    const uacInput = screen.getByPlaceholderText("Enter 12-digit UAC");

    fireEvent.change(uacInput, { target: { value: invalid_uac } });

    expect(getByText("UAC must be exactly 12 digits")).toBeDefined();

    const disableUacButton = getByRole("button", { name: "Disable UAC" });

    expect(disableUacButton).toBeDisabled();
  });

  it("correctly shows the message to the user if user enters alphabet and keeps the button disabled", async () => {
    const { getByText, getByRole } = render(
      <MemoryRouter>
        <Form />
      </MemoryRouter>,
    );

    await act(async () => {
      await flushPromises();
    });

    const invalid_uac = "12345abc";
    const uacInput = screen.getByPlaceholderText("Enter 12-digit UAC");

    fireEvent.change(uacInput, { target: { value: invalid_uac } });

    expect(getByText("UAC must contain digits only")).toBeDefined();

    const disableUacButton = getByRole("button", { name: "Disable UAC" });

    expect(disableUacButton).toBeDisabled();
  });

  it("navigates correctly to the right url i-e, Confirmation screen on clicking disable UAC button", async () => {
    (useNavigate as Mock).mockReturnValue(navigate);

    const { getByRole } = render(
      <MemoryRouter>
        <Form />
      </MemoryRouter>,
    );

    await act(async () => {
      await flushPromises();
    });

    const uac = "123456789123";
    const uacInput = screen.getByPlaceholderText("Enter 12-digit UAC");

    fireEvent.change(uacInput, { target: { value: uac } });

    const disableUacButton = getByRole("button", { name: "Disable UAC" });

    fireEvent.click(disableUacButton);

    expect(navigate).toHaveBeenCalledWith("/disable-uac", { state: { step: "confirmation", uac } });
  });
});

describe("Disable UAC page correctly displays Response from API call to disable UAC", async () => {
  beforeEach(() => {
    navigate = vi.fn();
  });

  const disabledComponentStateWithSuccessDisableResponse: DisableUacResultState = {
    disabledUac: "100461197284",
    responseCode: 200,
  };

  const disabledComponentStateWithErrorDisableResponse: DisableUacResultState = {
    disabledUac: "100461197282",
    responseCode: 500,
  };

  it("displays the Success Panel for disabling the UAC on landing in Disable UAC view if returned from DisableConfirmationComponent", async () => {
    const { getByText } = render(
      <MemoryRouter>
        <Form resultState={disabledComponentStateWithSuccessDisableResponse} />
      </MemoryRouter>,
    );

    await act(async () => {
      await flushPromises();
    });

    expect(
      getByText(
        `UAC ${disabledComponentStateWithSuccessDisableResponse.disabledUac} has been disabled`,
      ),
    ).toBeDefined();
  });

  it("displays the Error Panel for disabling the UAC on landing in Disable UAC view if returned from DisableConfirmationComponent", async () => {
    const { getByText } = render(
      <MemoryRouter>
        <Form resultState={disabledComponentStateWithErrorDisableResponse} />
      </MemoryRouter>,
    );

    await act(async () => {
      await flushPromises();
    });

    expect(
      getByText(
        `Failed to disable UAC ${disabledComponentStateWithErrorDisableResponse.disabledUac}`,
      ),
    ).toBeDefined();
  });
});
