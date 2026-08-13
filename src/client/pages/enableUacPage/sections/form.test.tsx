import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, useNavigate } from "react-router-dom";

import Form from "./form";

import type * as ReactRouterDom from "react-router-dom";
import type { Mock } from "vitest";

vi.mock("react-router-dom", async (importOriginal) => {
  const mod = await importOriginal<typeof ReactRouterDom>();

  return {
    ...mod,
    useNavigate: vi.fn(),
  };
});

describe("Enable UAC form", () => {
  it("keeps the enable button disabled until a 12-digit UAC is entered", () => {
    render(
      <MemoryRouter>
        <Form />
      </MemoryRouter>,
    );

    const enableButton = screen.getByRole("button", { name: "Enable UAC" });

    expect(enableButton).toBeDisabled();

    fireEvent.change(screen.getByPlaceholderText("Enter 12-digit UAC"), {
      target: { value: "123" },
    });

    expect(enableButton).toBeDisabled();

    fireEvent.change(screen.getByPlaceholderText("Enter 12-digit UAC"), {
      target: { value: "123456789012" },
    });

    expect(enableButton).toBeEnabled();
  });

  it("navigates to confirmation using only the entered UAC", () => {
    const navigate = vi.fn();

    (useNavigate as Mock).mockReturnValue(navigate);

    render(
      <MemoryRouter>
        <Form />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByPlaceholderText("Enter 12-digit UAC"), {
      target: { value: "123456789012" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Enable UAC" }));

    expect(navigate).toHaveBeenCalledWith("/enable-uac", {
      state: { step: "confirmation", uac: "123456789012" },
    });
  });
});
