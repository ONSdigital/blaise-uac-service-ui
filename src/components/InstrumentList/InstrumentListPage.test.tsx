/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, waitFor, cleanup } from "@testing-library/react";
import InstrumentListPage from "./InstrumentListPage";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import { instrumentNames } from "./../../mocks/api-mocks";
import { act } from "react";

jest.mock("../../client/file-functions");
import { getListOfInstrumentsWhichHaveExistingSampleFiles } from "../../client/file-functions";

const getListOfInstrumentsWhichHaveExistingSampleFilesMock = getListOfInstrumentsWhichHaveExistingSampleFiles as jest.Mock<Promise<string[]>>;

describe("Instrument list page", () => {
    beforeEach(() => {
        getListOfInstrumentsWhichHaveExistingSampleFilesMock.mockImplementation(() => Promise.resolve(instrumentNames));
    });

    it("instrument list page matches Snapshot", async () => {
        
        let wrapper:any;
        
        await act(async () => {
            wrapper = render(<InstrumentListPage />, { wrapper: MemoryRouter });
        });

        await waitFor(() => {
            expect(wrapper).toMatchSnapshot();
        });
    });

    it("should render correctly", async () => {
        
        let queryByText:any;

        await act(async () => {
            const renderResult = render(<InstrumentListPage />, { wrapper: MemoryRouter });
            queryByText = renderResult.queryByText;
        });

        await waitFor(() => {
            instrumentNames.forEach((instrumentName) => {
                expect(queryByText(instrumentName)).toBeInTheDocument();
            });
        });
    });

    it("should display an appropriate message if no samples are uploaded", async () => {
        getListOfInstrumentsWhichHaveExistingSampleFilesMock.mockImplementation(() => Promise.resolve([]));
        
        let queryByText:any;

        await act(async () => {
            const renderResult = render(<InstrumentListPage />, { wrapper: MemoryRouter });
            queryByText = renderResult.queryByText;
        });

        await waitFor(() => {
            expect(queryByText(/No questionnaire samples found./i)).toBeInTheDocument();
        });
    });

    it("should display an appropriate error message if service does not respond correctly", async () => {
        getListOfInstrumentsWhichHaveExistingSampleFilesMock.mockImplementation(() => Promise.reject());
        
        let queryByText:any;

        await act(async () => {
            const renderResult = render(<InstrumentListPage />, { wrapper: MemoryRouter });
            queryByText = renderResult.queryByText;
        });

        await waitFor(() => {
            expect(queryByText(/Unable to retrieve list of questionnaire samples./i)).toBeInTheDocument();
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
        cleanup();
    });
});
