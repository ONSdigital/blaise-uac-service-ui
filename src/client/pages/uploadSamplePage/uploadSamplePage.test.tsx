import "@testing-library/jest-dom";
import { act, cleanup, fireEvent, screen, waitFor } from "@testing-library/react";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { MemoryRouter, useNavigate } from "react-router-dom";

import * as fileFunctions from "../../fileFunctions";
import { getFileName } from "../../fileFunctions";
import { renderWithQueryClient } from "../../test-utils/renderWithQueryClient";

import UploadSample from "./uploadSamplePage";

import type * as ReactRouterDom from "react-router-dom";
import type { Mock } from "vitest";

vi.mock("react-router-dom", async (importOriginal) => {
  const mod = await importOriginal<typeof ReactRouterDom>();

  return {
    ...mod,
    useNavigate: vi.fn().mockReturnValue(vi.fn()),
  };
});

const mock = new MockAdapter(axios, { onNoMatch: "throwException" });

const questionnaireName = "DST1234A";
const fileName = getFileName(questionnaireName);

describe("Upload Sample Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mock.reset();
  });

  it("select file page matches Snapshot", async () => {
    const wrapper = renderWithQueryClient(
      <MemoryRouter>
        <UploadSample />
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
        <UploadSample />
      </MemoryRouter>,
    );

    expect(queryByText(/Which questionnaire needs UACs generated?/i)).toBeInTheDocument();
  });

  const invalidQuestionnaireNameTestCases = [
    {
      questionnaireName: [null, undefined, "", "dst", "dst1", "2013dst", "ds2013a", "dst201a"],
    },
  ];

  invalidQuestionnaireNameTestCases.forEach((test) => {
    it(`Enter questionnaire name - should display an error message if you enter an invalid questionnaire name - ${test.questionnaireName}`, async () => {
      renderWithQueryClient(
        <MemoryRouter>
          <UploadSample />
        </MemoryRouter>,
      );

      const inputQuestionnaireName = screen.getByLabelText(/questionnaire name/i);

      fireEvent.change(inputQuestionnaireName, { target: { value: test.questionnaireName } });

      await fireEvent.click(screen.getByText(/Continue/));

      await waitFor(() => {
        expect(
          screen.queryAllByText("Enter a valid questionnaire name, e.g. OPN2101A."),
        ).toHaveLength(1);
      });
    });
  });

  it("Enter questionnaire name - Should navigate to confirm screen", async () => {
    mock.onGet(`/api/v1/file/${fileName}/exists`).reply(200, false);

    await EnterQuestionnaireNameAndContinue();

    await waitFor(() => {
      expect(screen.getByText("Yes, that's correct")).toBeDefined();
    });
  });

  it("Confirm questionnaire name - should navigate to select file", async () => {
    mock.onGet(`/api/v1/file/${fileName}/exists`).reply(200, false);

    await EnterQuestionnaireNameAndContinue();
    await ConfirmQuestionnaireName();

    await waitFor(() => {
      expect(screen.queryAllByText("Select a sample file")).toHaveLength(1);
    });
  });

  it("Confirm questionnaire name - should navigate to Enter questionnaire name", async () => {
    mock.onGet(`/api/v1/file/${fileName}/exists`).reply(200, false);

    await EnterQuestionnaireNameAndContinue();
    await AmendQuestionnaireName();

    await waitFor(() => {
      expect(screen.queryByText(/Which questionnaire needs UACs generated?/i)).toBeInTheDocument();
    });
  });

  it("Enter questionnaire name - should navigate to the select file option if a sample for the questionnaire has not been previously uploaded", async () => {
    mock.onGet(`/api/v1/file/${fileName}/exists`).reply(200, false);

    await EnterQuestionnaireNameAndContinue();
    await ConfirmQuestionnaireName();

    await waitFor(() => {
      expect(screen.queryAllByText("Select a sample file")).toHaveLength(1);
    });
  });

  it("Enter questionnaire name - should navigate to the overwrite sample option if a sample for the questionnaire has been previously uploaded", async () => {
    mock.onGet(`/api/v1/file/${fileName}/exists`).reply(200, true);

    await EnterQuestionnaireNameAndContinue();
    await ConfirmQuestionnaireName();

    await waitFor(() => {
      expect(screen.queryAllByText("Overwrite sample file?")).toHaveLength(1);
    });
  });

  it("Overwrite sample - should navigate to the select file option if yes is selected", async () => {
    await NavigateToOverwriteFileAndContinue(true);

    await waitFor(() => {
      expect(screen.queryAllByText("Select a sample file")).toHaveLength(1);
    });
  });

  it("Overwrite sample - should navigate home if no is selected", async () => {
    await NavigateToOverwriteFileAndContinue(false);

    await waitFor(() => {
      expect(screen.queryAllByText("Which questionnaire needs UACs generated?")).toHaveLength(1);
    });
  });

  it("Select sample file - should display an error message if you dont select a file", async () => {
    await NavigateToSelectFile();

    await fireEvent.click(screen.getByText(/Continue/));

    await waitFor(() => {
      expect(screen.queryAllByText("Select a file")).toHaveLength(1);
    });
  });

  it("Select sample file - should display an error message if the selected file is not a .csv", async () => {
    await NavigateToSelectFileAndUpload("txt");

    await fireEvent.click(screen.getByText(/Continue/));

    await waitFor(() => {
      expect(screen.queryAllByText("File must be a .csv")).toHaveLength(1);
    });
  });

  it("Select sample file - should display an upload failed message if file fails to upload", async () => {
    mock.onPost(`/api/v1/questionnaire/${questionnaireName}/uac/sample`).reply(500);

    await NavigateToSelectFileAndUpload("csv");

    await waitFor(() => {
      expect(screen.queryAllByText("File upload failed")).toHaveLength(1);
    });
  });

  it("Select sample file - should redirect to login when upload returns 401", async () => {
    const assign = vi.fn();

    vi.stubGlobal("location", { assign });
    mock.onPost(`/api/v1/questionnaire/${questionnaireName}/uac/sample`).reply(401);

    await NavigateToSelectFileAndUpload("csv");

    await waitFor(() => {
      expect(assign).toHaveBeenCalledWith("/");
    });

    expect(screen.queryByText("File upload failed")).toBeNull();

    vi.unstubAllGlobals();
  });

  it("Select sample file - should return a specific error when the import fails with a reason", async () => {
    mock
      .onPost(`/api/v1/questionnaire/${questionnaireName}/uac/sample`)
      .reply(500, { error: "All the bunnies melted" });

    await NavigateToSelectFileAndUpload("csv");

    await waitFor(() => {
      expect(screen.queryAllByText("All the bunnies melted")).toHaveLength(1);
    });
  });

  it("Confirm questionnaire name - should display an error if the file check fails", async () => {
    mock.onGet(`/api/v1/file/${fileName}/exists`).reply(500, "Checking file existence failed");

    await EnterQuestionnaireNameAndContinue();
    await ConfirmQuestionnaireName();

    await waitFor(() => {
      expect(screen.queryAllByText("File upload failed")).toHaveLength(1);
    });
  });

  it("Confirm questionnaire name - should redirect to login when the file check returns 401", async () => {
    const assign = vi.fn();

    vi.stubGlobal("location", { assign });
    mock.onGet(`/api/v1/file/${fileName}/exists`).reply(401);

    await EnterQuestionnaireNameAndContinue();
    await ConfirmQuestionnaireName();

    await waitFor(() => {
      expect(assign).toHaveBeenCalledWith("/");
    });

    expect(screen.queryByText("File upload failed")).toBeNull();

    vi.unstubAllGlobals();
  });

  it("Select sample file and continue - protect against multiple uploads", async () => {
    let completeRequest: (response: unknown) => void = () => {};

    mock.onPost(`/api/v1/questionnaire/${questionnaireName}/uac/sample`).reply(
      () =>
        new Promise((resolve) => {
          completeRequest = resolve as (response: unknown) => void;
        }),
    );

    await NavigateToSelectFileAndUpload("csv");
    await waitFor(() => {
      expect(mock.history.post.length).toBe(1);
    });

    const continueButton = screen.getByRole("button", { name: "Continue" });

    await fireEvent.click(continueButton);

    completeRequest([201]);
    await waitFor(() => {
      expect(screen.queryByText("UACs generated for")).toBeNull();
    });

    expect(mock.history.post.length).toBe(1);
    expect(mock.history.post[0].url).toEqual("/api/v1/questionnaire/DST1234A/uac/sample");
  });

  it("Select sample file - should navigate to the download UAC option when a file is selected", async () => {
    mock.onPost(`/api/v1/questionnaire/${questionnaireName}/uac/sample`).reply(201);

    await NavigateToSelectFileAndUpload("csv");

    await waitFor(() => {
      expect(screen.queryAllByText(`UACs generated for ${questionnaireName}`)).toHaveLength(1);
      expect(
        screen.queryAllByText(
          "You can download the sample file with generated UACs appended from here or the home screen",
        ),
      ).toHaveLength(1);
    });
  });

  it("Download UAC file step - should navigate home when Continue is clicked", async () => {
    mock.onPost(`/api/v1/questionnaire/${questionnaireName}/uac/sample`).reply(201);

    await NavigateToSelectFileAndUpload("csv");

    await waitFor(() => {
      expect(screen.queryAllByText(`UACs generated for ${questionnaireName}`)).toHaveLength(1);
    });

    const navigateMock = (useNavigate as Mock).mock.results.at(-1)?.value as Mock;

    await act(async () => {
      fireEvent.click(screen.getByText(/Continue/));
    });

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith("/");
    });
  });

  it("Confirm questionnaire name - should display an error when no option is selected", async () => {
    await EnterQuestionnaireNameAndContinue();

    await waitFor(() => {
      expect(screen.getByText("Yes, that's correct")).toBeDefined();
    });

    await fireEvent.click(screen.getByText(/Continue/));

    await waitFor(() => {
      expect(screen.queryByText("Select an option")).toBeInTheDocument();
    });
  });

  it("Overwrite sample - should display an error when no option is selected", async () => {
    mock.onGet(`/api/v1/file/${fileName}/exists`).reply(200, true);

    await EnterQuestionnaireNameAndContinue();
    await ConfirmQuestionnaireName();

    await waitFor(() => {
      expect(screen.queryAllByText("Overwrite sample file?")).toHaveLength(1);
    });

    await fireEvent.click(screen.getByText(/Continue/));

    await waitFor(() => {
      expect(screen.queryByText("Select an option")).toBeInTheDocument();
    });
  });

  it("Select sample file - should handle multiple files being selected", async () => {
    await NavigateToSelectFile();
    const inputEl = screen.getByLabelText(/Select a sample file/i);

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

  it("Select sample file - should display upload failed with non-axios error", async () => {
    mock.onPost(`/api/v1/questionnaire/${questionnaireName}/uac/sample`).networkError();

    await NavigateToSelectFileAndUpload("csv");

    await waitFor(() => {
      expect(screen.queryAllByText("File upload failed")).toHaveLength(1);
    });
  });

  it("Select sample file - should display upload failed when the upload rejects a non-Error value", async () => {
    vi.spyOn(fileFunctions, "generateUacsForSampleFile").mockRejectedValueOnce("plain failure");

    await NavigateToSelectFileAndUpload("csv");

    await waitFor(() => {
      expect(screen.queryAllByText("File upload failed")).toHaveLength(1);
    });
  });

  it("Confirm questionnaire name - should display upload failed when the file check throws a non-Error value", async () => {
    vi.spyOn(fileFunctions, "sampleFileAlreadyExists").mockRejectedValueOnce("plain failure");

    await EnterQuestionnaireNameAndContinue();
    await ConfirmQuestionnaireName();

    await waitFor(() => {
      expect(screen.queryAllByText("File upload failed")).toHaveLength(1);
    });
  });

  it("Upload failed step - should return to the questionnaire name step when Continue is clicked", async () => {
    mock.onPost(`/api/v1/questionnaire/${questionnaireName}/uac/sample`).reply(500);

    await NavigateToSelectFileAndUpload("csv");

    await waitFor(() => {
      expect(screen.queryAllByText("File upload failed")).toHaveLength(1);
    });

    await fireEvent.click(screen.getByText(/Continue/));

    await waitFor(() => {
      expect(screen.queryByText(/Which questionnaire needs UACs generated?/i)).toBeInTheDocument();
    });
  });

  it("Questionnaire name step - should render with undefined questionnaire name", async () => {
    const { queryByText } = renderWithQueryClient(
      <MemoryRouter>
        <UploadSample />
      </MemoryRouter>,
    );

    expect(queryByText(/Which questionnaire needs UACs generated?/i)).toBeInTheDocument();
  });

  afterEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it("Overwrite sample - should submit overwrite=true when replacement is confirmed", async () => {
    mock.onPost(`/api/v1/questionnaire/${questionnaireName}/uac/sample`).reply(201);

    await NavigateToOverwriteFileAndContinue(true);
    await waitFor(() => {
      expect(screen.queryAllByText("Select a sample file")).toHaveLength(1);
    });

    const inputEl = screen.getByLabelText(/Select a sample file/i);
    const file = new File(["(⌐□_□)"], "OPN2004A.csv", { type: "csv" });

    Object.defineProperty(inputEl, "files", {
      value: [file],
    });

    await act(async () => {
      fireEvent.change(inputEl);
      await fireEvent.click(screen.getByText(/Continue/));
    });

    expect(mock.history.post.at(-1)?.data.get("overwrite")).toBe("true");
  });
});

async function EnterQuestionnaireNameAndContinue() {
  renderWithQueryClient(
    <MemoryRouter>
      <UploadSample />
    </MemoryRouter>,
  );

  //Enter questionnaire name
  const inputQuestionnaireName = screen.getByLabelText(/questionnaire name/i);

  fireEvent.change(inputQuestionnaireName, { target: { value: questionnaireName } });

  await fireEvent.click(screen.getByText(/Continue/));
}

async function ConfirmQuestionnaireName() {
  await waitFor(() => {
    expect(screen.getByText("Yes, that's correct")).toBeDefined();
  });

  await fireEvent.click(screen.getByText("Yes, that's correct"));
  await fireEvent.click(screen.getByText(/Continue/));
}

async function AmendQuestionnaireName() {
  await waitFor(() => {
    expect(screen.getByText("No, I need to change it")).toBeDefined();
  });

  await fireEvent.click(screen.getByText("No, I need to change it"));
  await fireEvent.click(screen.getByText(/Continue/));
}

async function NavigateToOverwriteFileAndContinue(overwrite: boolean) {
  mock.onGet(`/api/v1/file/${fileName}/exists`).reply(200, true);

  await EnterQuestionnaireNameAndContinue();
  await ConfirmQuestionnaireName();

  await waitFor(() => {
    expect(screen.queryAllByText("Overwrite sample file?")).toHaveLength(1);
  });

  const labelText = overwrite === true ? /Yes/i : /No/i;
  const overwriteSample = screen.getByLabelText(labelText);

  fireEvent.click(overwriteSample);

  await fireEvent.click(screen.getByText(/Continue/));
}

async function NavigateToSelectFile() {
  mock.onGet(`/api/v1/file/${fileName}/exists`).reply(200, false);

  await EnterQuestionnaireNameAndContinue();
  await ConfirmQuestionnaireName();

  await waitFor(() => {
    expect(screen.queryAllByText("Select a sample file")).toHaveLength(1);
  });
}

async function NavigateToSelectFileAndUpload(fileExtension: string) {
  await NavigateToSelectFile();
  const inputEl = screen.getByLabelText(/Select a sample file/i);

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
