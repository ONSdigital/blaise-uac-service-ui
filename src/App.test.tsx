import React from "react";
import {render, waitFor, screen, act} from "@testing-library/react";
import App from "./App";
import {createMemoryHistory} from "history";
import {Router} from "react-router";
import "@testing-library/jest-dom";
import {instrumentNames} from "./mocks/api-mocks";

jest.mock("./client/instrument-functions");
import {getInstrumentsWithExistingUacCodes} from "./client/instrument-functions";

const getInstrumentsWithExistingUacCodesMock = getInstrumentsWithExistingUacCodes as jest.Mock<Promise<string[]>>;

describe("React homepage", () => {
    beforeAll(() => {
        getInstrumentsWithExistingUacCodesMock.mockImplementation(() => Promise.resolve(instrumentNames));
    });

    it("App page matches snapshot", async () => {
        const history = createMemoryHistory();
        const wrapper = render(
            <Router history={history}>
                <App/>
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
                <App/>
            </Router>
        );

        await act(async () => await waitFor(() => {
            expect(queryByText(/Questionnaires that have been previously uploaded/i)).toBeInTheDocument();
            instrumentNames.forEach((instrumentName) => {
              expect(queryByText(instrumentName)).toBeInTheDocument();
            });
        }));
    });

    afterAll(() => {
        jest.clearAllMocks();
    });
});
