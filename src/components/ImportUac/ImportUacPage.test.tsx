/**
 * @jest-environment jsdom
 */

import React from "react";
import { Router } from "react-router";
import { render, waitFor, fireEvent, cleanup, screen, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { createMemoryHistory } from "history";
import ImportUacPage from "./ImportUacPage";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";

const mock = new MockAdapter(axios, { onNoMatch: "throwException" });

describe("Import UAC Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it("import uac page matches Snapshot", async () => {
    const history = createMemoryHistory();
    const wrapper = render(
      <Router history={history}>
        <ImportUacPage />
      </Router>
    );

    await act(async () => await waitFor(() => {
      expect(wrapper).toMatchSnapshot();
    }));
  });

  it("should render correctly", async () => {
    const history = createMemoryHistory();
    const { queryByText } = render(
      <Router history={history}>
        <ImportUacPage />
      </Router>
    );

    expect(queryByText(/Import UACs from file/i)).toBeInTheDocument();
  });

  it("Select uac file - should display an error message if you dont select a file", async () => {
    await NavigateToSelectFile();

    await fireEvent.click(screen.getByText(/Continue/));

    await waitFor(() => {
      expect(screen.queryAllByText("Select a file")).toHaveLength(2);
    });
  });

  it("Select uac file - should display an error message if the selected file is not a .csv", async () => {
    await NavigateToSelectFileAndUpload("txt");

    await fireEvent.click(screen.getByText(/Continue/));

    await waitFor(() => {
      expect(screen.queryAllByText("File must be a .csv")).toHaveLength(2);
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
    mock.onPost("/api/v1/uac/import").reply(200, {uacs_imported: 12});

    await NavigateToSelectFileAndUpload("csv");

    await waitFor(() => {
      expect(screen.queryAllByText("UACs Imported: 12")).toHaveLength(1);
    });
  });


  it("Select uac file - should navigate to the success page with uac_import count - when the api doesn't respond with a count", async () => {
    mock.onPost("/api/v1/uac/import").reply(200);

    await NavigateToSelectFileAndUpload("csv");

    await waitFor(() => {
      expect(screen.queryAllByText("UACs Imported: 0")).toHaveLength(1);
    });
  });

  it(("Select uac file - should return a generic error when the import fails"), async () => {
    mock.onPost("/api/v1/uac/import").reply(500);

    await NavigateToSelectFileAndUpload("csv");

    await waitFor(() => {
      expect(screen.queryAllByText("File upload failed")).toHaveLength(1);
    });
  });



  it(("Select uac file - should return a specifc error when the import fails with a reason"), async () => {
    mock.onPost("/api/v1/uac/import").reply(500, {error: "All the kittens melted"});

    await NavigateToSelectFileAndUpload("csv");

    await waitFor(() => {
      expect(screen.queryAllByText("All the kittens melted")).toHaveLength(1);
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    cleanup();
  });
});


async function NavigateToSelectFile() {
  const history = createMemoryHistory();
  render(
    <Router history={history}>
      <ImportUacPage />
    </Router>
  );

  await waitFor(() => {
    expect(screen.queryAllByText("Select a uac file")).toHaveLength(1);
  });
}

async function NavigateToSelectFileAndUpload(fileExtension: string) {
  await NavigateToSelectFile();
  const inputEl = screen.getByLabelText(/Select a uac file/i);

  const file = new File(["(⌐□_□)"], `OPN2004A.${fileExtension}`, {
    type: fileExtension
  });

  Object.defineProperty(inputEl, "files", {
    value: [file]
  });

  fireEvent.change(inputEl);

  await fireEvent.click(screen.getByText(/Continue/));
}
