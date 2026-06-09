import "@testing-library/jest-dom";
import { cleanup, fireEvent, screen, waitFor } from "@testing-library/react";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { act } from "react";
import { MemoryRouter } from "react-router-dom";

import * as fileFunctions from "../../api/fileFunctions";
import { renderWithQueryClient } from "../../test-utils/renderWithQueryClient";

import UploadUsedUacs from "./uploadUsedUacsPage";

const mock = new MockAdapter(axios, { onNoMatch: "throwException" });

describe("Import UAC Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("import uac page matches Snapshot", async () => {
    const wrapper = renderWithQueryClient(
      <MemoryRouter>
        <UploadUsedUacs />
      </MemoryRouter>,
    );

    await act(
      async () =>
        await waitFor(() => {
          expect(wrapper).toMatchSnapshot();
        }),
    );
  });

  it("should render correctly", async () => {
    const { queryByText } = renderWithQueryClient(
      <MemoryRouter>
        <UploadUsedUacs />
      </MemoryRouter>,
    );

    expect(queryByText(/Select a UAC file/i)).toBeInTheDocument();
  });

  it("Select uac file - should display an error message if you dont select a file", async () => {
    await NavigateToSelectFile();

    await fireEvent.click(screen.getByText(/Continue/));

    await waitFor(() => {
      expect(screen.queryAllByText("Select a file")).toHaveLength(1);
    });
  });

  it("Select uac file - should display an error message if the selected file is not a .csv", async () => {
    await NavigateToSelectFileAndUpload("txt");

    await fireEvent.click(screen.getByText(/Continue/));

    await waitFor(() => {
      expect(screen.queryAllByText("File must be a .csv")).toHaveLength(1);
    });
  });

  it("Select uac file - should display an upload filed message if file fails to upload", async () => {
    mock.onPost("/api/v1/uac/import").reply(500);

    await NavigateToSelectFileAndUpload("csv");

    await waitFor(() => {
      expect(screen.queryAllByText("File upload failed")).toHaveLength(1);
    });
  });

  it("Select uac file - should navigate to the success page with uac_import count", async () => {
    mock.onPost("/api/v1/uac/import").reply(200, { uacs_imported: 12 });

    await NavigateToSelectFileAndUpload("csv");

    await waitFor(() => {
      expect(screen.queryAllByText("12 UACs imported")).toHaveLength(1);
    });
  });

  it("Upload successful - should return to the select file screen when Continue is clicked", async () => {
    mock.onPost("/api/v1/uac/import").reply(200, { uacs_imported: 1 });

    await NavigateToSelectFileAndUpload("csv");

    await waitFor(() => {
      expect(screen.queryAllByText("Upload complete")).toHaveLength(1);
    });

    await fireEvent.click(screen.getByText(/Continue/));

    await waitFor(() => {
      expect(screen.queryAllByText("Select a UAC file")).toHaveLength(1);
    });
  });

  it("Select uac file - should navigate to the success page with uac_import count - when the api doesn't respond with a count", async () => {
    mock.onPost("/api/v1/uac/import").reply(200);

    await NavigateToSelectFileAndUpload("csv");

    await waitFor(() => {
      expect(screen.queryAllByText("0 UACs imported")).toHaveLength(1);
    });
  });

  it("Select uac file - should return a generic error when the import fails", async () => {
    mock.onPost("/api/v1/uac/import").reply(500);

    await NavigateToSelectFileAndUpload("csv");

    await waitFor(() => {
      expect(screen.queryAllByText("File upload failed")).toHaveLength(1);
    });
  });

  it("Select uac file - should return a specifc error when the import fails with a reason", async () => {
    mock.onPost("/api/v1/uac/import").reply(500, { error: "All the kittens melted" });

    await NavigateToSelectFileAndUpload("csv");

    await waitFor(() => {
      expect(screen.queryAllByText("All the kittens melted")).toHaveLength(1);
    });
  });

  it("Select uac file - should handle multiple files selected without uploading", async () => {
    await NavigateToSelectFile();
    const inputEl = screen.getByLabelText(/Select a UAC file/i);

    const files = [
      new File(["content"], "file1.csv", { type: "text/csv" }),
      new File(["content"], "file2.csv", { type: "text/csv" }),
    ];

    Object.defineProperty(inputEl, "files", {
      value: files,
      writable: true,
    });

    await act(async () => {
      fireEvent.change(inputEl);
    });

    await fireEvent.click(screen.getByText(/Continue/));

    await waitFor(() => {
      expect(screen.queryByText("Select a file")).toBeInTheDocument();
    });
  });

  it("Select uac file - should display upload failed with non-axios error", async () => {
    mock.onPost("/api/v1/uac/import").networkError();

    await NavigateToSelectFileAndUpload("csv");

    await waitFor(() => {
      expect(screen.queryAllByText("File upload failed")).toHaveLength(1);
    });
  });

  it("Select uac file - redirects to login when the upload returns 401", async () => {
    const assign = vi.fn();

    vi.stubGlobal("location", { assign });
    mock.onPost("/api/v1/uac/import").reply(401);

    await NavigateToSelectFileAndUpload("csv");

    await waitFor(() => {
      expect(assign).toHaveBeenCalledWith("/");
    });

    expect(screen.queryByText("File upload failed")).toBeNull();

    vi.unstubAllGlobals();
  });

  it("Select uac file - should display upload failed when the mutation rejects a non-Error value", async () => {
    vi.spyOn(fileFunctions, "importUacsFromFile").mockRejectedValueOnce("plain failure");

    await NavigateToSelectFileAndUpload("csv");

    await waitFor(() => {
      expect(screen.queryAllByText("File upload failed")).toHaveLength(1);
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    cleanup();
  });
});

async function NavigateToSelectFile() {
  renderWithQueryClient(
    <MemoryRouter>
      <UploadUsedUacs />
    </MemoryRouter>,
  );

  await waitFor(() => {
    expect(screen.queryAllByText("Select a UAC file")).toHaveLength(1);
  });
}

async function NavigateToSelectFileAndUpload(fileExtension: string) {
  await NavigateToSelectFile();
  const inputEl = screen.getByLabelText(/Select a UAC file/i);

  const file = new File(["(⌐□_□)"], `OPN2004A.${fileExtension}`, {
    type: fileExtension,
  });

  Object.defineProperty(inputEl, "files", {
    value: [file],
  });

  await act(async () => {
    fireEvent.change(inputEl);
    await fireEvent.click(screen.getByText(/Continue/));
  });
}
