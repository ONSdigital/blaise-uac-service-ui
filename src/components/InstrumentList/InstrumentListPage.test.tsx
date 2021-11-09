/**
 * @jest-environment jsdom
 */

import React from "react";
import {render, waitFor, screen, act, cleanup} from "@testing-library/react";
import InstrumentListPage from "./InstrumentListPage";
import {createMemoryHistory} from "history";
import {Router} from "react-router";
import "@testing-library/jest-dom";
import {instrumentNames} from "./../../mocks/api-mocks";

jest.mock("../../client/file-functions");
import {getListOfInstrumentsWhichHaveExistingSampleFiles} from "../../client/file-functions";

const getListOfInstrumentsWhichHaveExistingSampleFilesMock = getListOfInstrumentsWhichHaveExistingSampleFiles as jest.Mock<Promise<string[]>>;

describe("Instrument list page", () => {
    beforeEach(() => {
        getListOfInstrumentsWhichHaveExistingSampleFilesMock.mockImplementation(() => Promise.resolve(instrumentNames));
    });

    it("instrument list page matches Snapshot", async () => {
        const history = createMemoryHistory();
        const wrapper = render(
            <Router history={history}>
                <InstrumentListPage />
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
                 <InstrumentListPage />
            </Router>
        );

        await act(async () => await waitFor(() => {
            instrumentNames.forEach((instrumentName) => {
              expect(queryByText(instrumentName)).toBeInTheDocument();
            });
        }));
    });

    it("should display an appropriate message if no samples are uploaded", async () => {
        getListOfInstrumentsWhichHaveExistingSampleFilesMock.mockImplementation(() => Promise.resolve([]));
        const history = createMemoryHistory();
        const {queryByText} = render(
            <Router history={history}>
                <InstrumentListPage/>
            </Router>
        );

        await act(async () => await waitFor(() => {
            expect(queryByText(/No questionnaire samples found./i)).toBeInTheDocument();
        }));
    });

    it("should display an appropriate error message if service does not respond correctly", async () => {
        getListOfInstrumentsWhichHaveExistingSampleFilesMock.mockImplementation(() => Promise.reject());
        const history = createMemoryHistory();
        const {queryByText} = render(
            <Router history={history}>
                <InstrumentListPage/>
            </Router>
        );

        await act(async () => await waitFor(() => {
            expect(queryByText(/Unable to retrieve list of questionnaire samples./i)).toBeInTheDocument();
        }));
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
        cleanup();
    });
});
