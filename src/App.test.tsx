/**
 * @jest-environment jsdom
 */

import React from "react";
import {render, waitFor, act} from "@testing-library/react";
import App from "./App";
import {createMemoryHistory} from "history";
import {Router} from "react-router";
import "@testing-library/jest-dom";
import {instrumentNames} from "./mocks/api-mocks";
import { AuthManager } from "blaise-login-react-client";

jest.mock("blaise-login-react-client");
AuthManager.prototype.loggedIn = jest.fn().mockImplementation(() => {
    return Promise.resolve(true);
});

jest.mock("./client/file-functions");
import {getListOfInstrumentsWhichHaveExistingSampleFiles} from "./client/file-functions";

const getListOfInstrumentsWhichHaveExistingSampleFilesMock = getListOfInstrumentsWhichHaveExistingSampleFiles as jest.Mock<Promise<string[]>>;

describe("React homepage", () => {
    beforeAll(() => {
        getListOfInstrumentsWhichHaveExistingSampleFilesMock.mockImplementation(() => Promise.resolve(instrumentNames));
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
            expect(queryByText(/Previously uploaded questionnaire samples/i)).toBeInTheDocument();
            instrumentNames.forEach((instrumentName) => {
              expect(queryByText(instrumentName)).toBeInTheDocument();
            });
        }));
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });
});
