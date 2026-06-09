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

describe("UploadFailed (upload used UACs)", () => {
  it("hides Service Desk advice and highlights missing column for known CSV errors", () => {
    render(<UploadFailed error={axiosError("Column Full_UAC is not in the CSV file")} />);

    expect(screen.queryByText("Service Desk")).not.toBeInTheDocument();
    expect(screen.getByText("Full_UAC")).toBeInTheDocument();
    expect(screen.getByText(/Column names are case sensitive/i)).toBeInTheDocument();
  });

  it("shows Service Desk advice and raw API error message for non-CSV errors", () => {
    render(<UploadFailed error={axiosError("Server returned 503")} />);

    expect(screen.getByText("Service Desk")).toBeInTheDocument();
    expect(screen.getByText("Server returned 503")).toBeInTheDocument();
  });
});
