import "@testing-library/jest-dom";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";

import { getSampleFileWithUacs } from "../../../api/fileFunctions";

import DownloadUacFile from "./downloadUacFile";

import type { Mock } from "vitest";

vi.mock("../../../api/fileFunctions");
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

const questionnaireName = "DST1234A";

describe("DownloadUacFile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the success panel and download button", () => {
    getSampleFileWithUacsMock.mockResolvedValue([]);

    render(<DownloadUacFile questionnaireName={questionnaireName} />);

    expect(screen.getByText(`UACs generated for ${questionnaireName}`)).toBeInTheDocument();
    expect(
      screen.getByText(
        "You can download the sample file with generated UACs appended from here or the home screen.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Download" })).toBeInTheDocument();
  });

  it("does not show error panel initially", () => {
    getSampleFileWithUacsMock.mockResolvedValue([]);

    render(<DownloadUacFile questionnaireName={questionnaireName} />);

    expect(
      screen.queryByText(`Could not download ${questionnaireName}.csv`),
    ).not.toBeInTheDocument();
  });

  it("calls getSampleFileWithUacs when download button is clicked successfully", async () => {
    getSampleFileWithUacsMock.mockResolvedValue([{ serial_number: "1", UAC: "123456789012" }]);

    render(<DownloadUacFile questionnaireName={questionnaireName} />);

    await act(async () => {
      fireEvent.click(screen.getByTestId("csv-downloader"));
    });

    expect(getSampleFileWithUacsMock).toHaveBeenCalledWith(
      questionnaireName,
      `${questionnaireName}.csv`,
    );
  });

  it("shows error panel when download fails", async () => {
    getSampleFileWithUacsMock.mockRejectedValue(new Error("Download failed"));

    render(<DownloadUacFile questionnaireName={questionnaireName} />);

    await act(async () => {
      fireEvent.click(screen.getByTestId("csv-downloader"));
    });

    await waitFor(() => {
      expect(screen.getByText(`Could not download ${questionnaireName}.csv`)).toBeInTheDocument();
    });
  });
});
