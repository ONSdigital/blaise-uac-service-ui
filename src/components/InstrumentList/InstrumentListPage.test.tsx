import React from "react";
import {render, waitFor, screen, act} from "@testing-library/react";
import InstrumentListPage from "./InstrumentListPage";
import {createMemoryHistory} from "history";
import {Router} from "react-router";
import "@testing-library/jest-dom";
import {instrumentNames} from "./../../mocks/api-mocks";

jest.mock("./../../client/instrument-functions");
import {getInstrumentsWithExistingUacCodes} from "./../../client/instrument-functions";

const getInstrumentsWithExistingUacCodesMock = getInstrumentsWithExistingUacCodes as jest.Mock<Promise<string[]>>;

describe("Instrument list page", () => {
    beforeAll(() => {
        getInstrumentsWithExistingUacCodesMock.mockImplementation(() => Promise.resolve(instrumentNames));
    });

    it("instrument list page matches Snapshot", async () => {
        const history = createMemoryHistory();
        const wrapper = render(
            <Router history={history}>
                <InstrumentListPage/>
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
                <InstrumentListPage/>
            </Router>
        );

        await act(async () => await waitFor(() => {
            instrumentNames.forEach((instrumentName) => {
              expect(queryByText(instrumentName)).toBeInTheDocument();
            });
        }));
    });

    afterAll(() => {
        jest.clearAllMocks();
    });
});
