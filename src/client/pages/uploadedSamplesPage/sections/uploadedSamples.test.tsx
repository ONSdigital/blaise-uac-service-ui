import "@testing-library/jest-dom";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { getSampleFileWithUacs } from "../../../fileFunctions";

import UploadedSamples from "./uploadedSamples";

import type { QuestionnaireFile } from "../../../questionnaire.types";
import type { Mock } from "vitest";

vi.mock("../../../fileFunctions");

const getSampleFileWithUacsMock = getSampleFileWithUacs as Mock<() => Promise<unknown>>;

vi.mock("react-csv-downloader", () => ({
  default: ({ children, datas }: { children: React.ReactNode; datas: () => Promise<unknown> }) => (
    <div
      data-testid="csv-downloader"
      onClick={async () => {
        try {
          await datas();
        } catch {
          // ignore
        }
      }}
    >
      {children}
    </div>
  ),
}));

const uploadedSamples: QuestionnaireFile[] = [
  { questionnaireName: "DST1234A", lastModified: "2024-01-15T14:41:29.000Z" },
  { questionnaireName: "OPN2101A", lastModified: "2024-03-10T09:00:00.000Z" },
];

describe("UploadedSamples", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders a loading panel when loading is true", () => {
    render(
      <MemoryRouter>
        <UploadedSamples
          uploadedSamples={uploadedSamples}
          loading={true}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it("renders questionnaire names when not loading", () => {
    getSampleFileWithUacsMock.mockResolvedValue([]);

    render(
      <MemoryRouter>
        <UploadedSamples
          uploadedSamples={uploadedSamples}
          loading={false}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText("DST1234A")).toBeInTheDocument();
    expect(screen.getByText("OPN2101A")).toBeInTheDocument();
  });

  it("renders Unknown when the questionnaire has no last modified date", () => {
    getSampleFileWithUacsMock.mockResolvedValue([]);

    render(
      <MemoryRouter>
        <UploadedSamples
          uploadedSamples={[{ questionnaireName: "DST1234A", lastModified: "" }]}
          loading={false}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText("Unknown")).toBeInTheDocument();
  });

  it("calls getSampleFileWithUacs when download button is clicked successfully", async () => {
    getSampleFileWithUacsMock.mockResolvedValue([{ serial_number: "1", UAC: "123456789012" }]);

    render(
      <MemoryRouter>
        <UploadedSamples
          uploadedSamples={[
            { questionnaireName: "DST1234A", lastModified: "2024-01-15T14:41:29.000Z" },
          ]}
          loading={false}
        />
      </MemoryRouter>,
    );

    const csvDownloaders = screen.getAllByTestId("csv-downloader");

    await act(async () => {
      fireEvent.click(csvDownloaders[0]);
    });

    expect(getSampleFileWithUacsMock).toHaveBeenCalledWith("DST1234A", "DST1234A.csv");
  });

  it("shows error row when download fails", async () => {
    getSampleFileWithUacsMock.mockRejectedValue(new Error("Download failed"));

    render(
      <MemoryRouter>
        <UploadedSamples
          uploadedSamples={[
            { questionnaireName: "DST1234A", lastModified: "2024-01-15T14:41:29.000Z" },
          ]}
          loading={false}
        />
      </MemoryRouter>,
    );

    const csvDownloaders = screen.getAllByTestId("csv-downloader");

    await act(async () => {
      fireEvent.click(csvDownloaders[0]);
    });

    await waitFor(() => {
      expect(screen.getByText("Could not download DST1234A.csv")).toBeInTheDocument();
    });
  });
});
