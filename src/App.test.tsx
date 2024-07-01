/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, waitFor } from "@testing-library/react";
import App from "./App";
import { MemoryRouter as Router } from "react-router";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import { instrumentNames } from "./mocks/api-mocks";
import { AuthManager } from "blaise-login-react/blaise-login-react-client";
import {act} from 'react';

jest.mock("blaise-login-react/blaise-login-react-client");
AuthManager.prototype.loggedIn = jest.fn().mockImplementation(() => {
    return Promise.resolve(true);
});

jest.mock("./client/file-functions");
import { getListOfInstrumentsWhichHaveExistingSampleFiles } from "./client/file-functions";

const mockIsProduction = jest.fn();
jest.mock("./client/env", () => ({
    isProduction: () => mockIsProduction()
}));

const getListOfInstrumentsWhichHaveExistingSampleFilesMock = getListOfInstrumentsWhichHaveExistingSampleFiles as jest.Mock<Promise<string[]>>;

describe("React homepage", () => {
    beforeAll(() => {
        getListOfInstrumentsWhichHaveExistingSampleFilesMock.mockImplementation(() => Promise.resolve(instrumentNames));
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
        mockIsProduction.mockReturnValue(false);
    });

    it("App page matches snapshot", async () => {
        const wrapper = render(<App />, { wrapper: Router });
        await waitFor(() => {
            expect(wrapper).toMatchSnapshot();
        });
    });

    it("should render correctly", async () => {

        let queryByText:any;

        await act(async () => {
            const renderResult = render(<App />, {wrapper: MemoryRouter});
            queryByText = renderResult.queryByText;
        });

        await waitFor(() => {
            expect(queryByText(/This environment is not a production environment. Do not upload any live data to this service./i)).toBeInTheDocument();
            expect(queryByText(/Previously uploaded questionnaire samples/i)).toBeInTheDocument();
            instrumentNames.forEach((instrumentName) => {
                expect(queryByText(instrumentName)).toBeInTheDocument();
            });
        });
    });

    it("view instrument page matches Snapshot in production", async () => {
        mockIsProduction.mockReturnValue(true);
        const { queryByText } = render(<App />, { wrapper: Router });
        await waitFor(() => {
            expect(queryByText(/This environment is not a production environment. Do not upload any live data to this service./i)).not.toBeInTheDocument();
        });
    });
});