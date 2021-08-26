import React from "react";
import {Router} from "react-router";
import {render, waitFor, fireEvent, cleanup, screen, act} from "@testing-library/react";
import "@testing-library/jest-dom";
import {createMemoryHistory} from "history";
import UploadSamplePage from "./UploadSamplePage";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import {getFileName} from "../../client/file-functions";
import {validSampleFileWithUacDatasResponse} from "../../mocks/csv-mocks";

const mock = new MockAdapter(axios, {onNoMatch: "throwException"});

const instrumentName = "DST1234A";
const fileName = getFileName(instrumentName);

describe("Upload Sample Page", () => {

    it("select file page matches Snapshot", async () => {
        const history = createMemoryHistory();
        const wrapper = render(
            <Router history={history}>
                <UploadSamplePage/>
            </Router>
        );

        await act(async () => await waitFor(() => {
            expect(wrapper).toMatchSnapshot();
        }));
    });

    it("should render correctly", async () => {
        const history = createMemoryHistory();
        const {queryByText} = render(
            <Router history={history}>
                <UploadSamplePage/>
            </Router>
        );

        expect(queryByText(/Which questionnaire do you wish to generate Unique Access Codes for?/i)).toBeInTheDocument();
    });

    const invalidInstrumentNameTestCases = [
        {
            instrumentName: [
                null,
                undefined,
                "",
                "dst",
                "dst1",
                "2013dst",
                "ds2013a",
                "dst201a",
            ]
        }
    ];

    invalidInstrumentNameTestCases.forEach(test => {
        it(`Enter instrument name - should display an error message if you enter an invalid instrument name - ${test.instrumentName}`, async () => {
            const history = createMemoryHistory();
            render(
                <Router history={history}>
                    <UploadSamplePage/>
                </Router>
            );

            const inputInstrumentName = screen.getByLabelText(/questionnaire name/i);
            fireEvent.change(inputInstrumentName, {target: {value: test.instrumentName}});

            await fireEvent.click(screen.getByText(/Continue/));

            await waitFor(() => {
                expect(screen.queryAllByText("Enter a questionnaire name in the correct format, such as DST2004")).toHaveLength(2);
            });
        });
    });

    it("Enter instrument name - should navigate to the select file option if a sample for the instrument has not been previously uploaded", async () => {
        mock.onGet(`/api/v1/file/${fileName}/exists`).reply(200, false);

        await EnterInstrumentNameAndContinue();

        await waitFor(() => {
            expect(screen.queryAllByText("Select a sample file")).toHaveLength(1);
        });
    });

    it("Enter instrument name - should navigate to the overwrite sample option if a sample for the instrument has been previously uploaded", async () => {
        mock.onGet(`/api/v1/file/${fileName}/exists`).reply(200, true);

        await EnterInstrumentNameAndContinue();

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


    it("Select sample file - should display an error message if you dont select a file", async () => {
        await NavigateToSelectFile();

        await fireEvent.click(screen.getByText(/Continue/));

        await waitFor(() => {
            expect(screen.queryAllByText("Select a file")).toHaveLength(2);
        });
    });

    it("Select sample file - should display an error message if the selected file is not a .csv", async () => {
        await NavigateToSelectFileAndUpload("txt");

        await fireEvent.click(screen.getByText(/Continue/));

        await waitFor(() => {
            expect(screen.queryAllByText("File must be a .csv")).toHaveLength(2);
        });
    });

    it("Select sample file - should display an upload filed message if file fails to upload", async () => {
        mock.onPost(`/api/v1/instrument/${instrumentName}/uac/sample`).reply(500);

        await NavigateToSelectFileAndUpload("csv");

        await waitFor(() => {
            expect(screen.queryAllByText("File upload failed")).toHaveLength(1);
        });
    });

    it("Select sample file - should navigate to the download UAC option when a file is selected", async () => {
        mock.onPost(`/api/v1/instrument/${instrumentName}/uac/sample`).reply(201, validSampleFileWithUacDatasResponse);

        await NavigateToSelectFileAndUpload("csv");

        await waitFor(() => {
            expect(screen.queryAllByText(`Successfully generated UACs for ${instrumentName}`)).toHaveLength(1);
            expect(screen.queryAllByText("Download CSV file")).toHaveLength(1);
        });
    });

    afterAll(() => {
        jest.clearAllMocks();
        cleanup();
    });
});

async function EnterInstrumentNameAndContinue() {
    const history = createMemoryHistory();
    render(
        <Router history={history}>
            <UploadSamplePage/>
        </Router>
    );

    //Enter instrument name
    const inputInstrumentName = screen.getByLabelText(/questionnaire name/i);
    fireEvent.change(inputInstrumentName, {target: {value: instrumentName}});

    await fireEvent.click(screen.getByText(/Continue/));
}

async function NavigateToOverwriteFileAndContinue(overwrite: boolean) {
    mock.onGet(`/api/v1/file/${fileName}/exists`).reply(200, true);

    await EnterInstrumentNameAndContinue();

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

    await EnterInstrumentNameAndContinue();

    await waitFor(() => {
        expect(screen.queryAllByText("Select a sample file")).toHaveLength(1);
    });
}

async function NavigateToSelectFileAndUpload(fileExtension: string) {
    await NavigateToSelectFile();
    const inputEl = screen.getByLabelText(/Select a sample file/i);

    const file = new File(["(⌐□_□)"], `OPN2004A.${fileExtension}`, {
        type: fileExtension
    });

    Object.defineProperty(inputEl, "files", {
        value: [file]
    });

    fireEvent.change(inputEl);

    await fireEvent.click(screen.getByText(/Continue/));
}
