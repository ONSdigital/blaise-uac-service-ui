import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";

import UploadFailed from "./uploadFailed";

import type { AxiosError } from "axios";

function axiosError(message: string): AxiosError {
  return {
    isAxiosError: true,
    response: { data: { error: message } },
  } as AxiosError;
}

describe("UploadFailed (upload sample)", () => {
  it("hides Service Desk advice and highlights missing column for known CSV errors", () => {
    render(
      <UploadFailed
        questionnaireName="DST1234A"
        error={axiosError("Column UAC is not in the CSV file")}
      />,
    );

    expect(screen.queryByText("Service Desk")).not.toBeInTheDocument();
    expect(screen.getByText("UAC")).toBeInTheDocument();
    expect(screen.getByText(/Column names are case sensitive/i)).toBeInTheDocument();
  });

  it("shows Service Desk advice and raw API error message for non-CSV errors", () => {
    render(
      <UploadFailed
        questionnaireName="DST1234A"
        error={axiosError("Backend unavailable")}
      />,
    );

    expect(screen.getByText("Service Desk")).toBeInTheDocument();
    expect(screen.getByText("Backend unavailable")).toBeInTheDocument();
  });
});
