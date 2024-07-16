/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import React from "react";
import { Authenticate } from "blaise-login-react/blaise-login-react-client";
import { BrowserRouter, MemoryRouter, useLocation, useParams } from "react-router-dom";
import ManageUacPage from "./ManageUacPage";
import { QuestionnaireWithDisabledUacs } from "./QuestionnaireListWithDisabledUacs";
import "@testing-library/jest-dom/extend-expect"; // for jest-dom matchers

// mock login
jest.mock("blaise-login-react/blaise-login-react-client");
const { MockAuthenticate } = jest.requireActual("blaise-login-react/blaise-login-react-client");
Authenticate.prototype.render = MockAuthenticate.prototype.render;
MockAuthenticate.OverrideReturnValues(null, true);

const listOfQuestionnairesWithDisabledUacs: QuestionnaireWithDisabledUacs[] = [{ "questionnaireName": "LMS2209_EM1", "disabledUacs": [{ "case_id": "803920", "uac": "100222938976" }] }];

jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useParams: jest.fn(),
    useLocation: jest.fn(),
}));

describe("Manage UAC Page correctly displays the right component (Disable OR Enable UAC) based on the Link user clicked", () => {

    const mockedUseParams = useParams as jest.Mock;
    const mockedUseLocation = useLocation as jest.Mock;

    it("renders Disable Component when user clicks on the Disable UAC Link on home page", () => {
        mockedUseParams.mockReturnValue({ action: "disable" });
        mockedUseLocation.mockReturnValue({ questionnaireName: "", uac: 0, case_id: "", responseStatus: "" });
        render(
            <BrowserRouter>
                <ManageUacPage />
            </BrowserRouter>
        );
        const disableUACButton = screen.getByRole("button", { name: "Disable UAC" });
        expect(disableUACButton).toBeDefined();

        const uacInput = screen.getByPlaceholderText("Enter 12 char UAC");
        expect(uacInput).toBeDefined();
    });

});

describe.skip("Manage UAC Page correctly displays the right component (Disable OR Enable UAC) based on the Link user clicked", () => {

    beforeEach(() => {
        global.fetch = jest.fn().mockResolvedValue({
            json: () => Promise.resolve(listOfQuestionnairesWithDisabledUacs),
        });
        // jest.spyOn(React, 'useState').mockReturnValueOnce([listOfQuestionnairesWithDisabledUacs, jest.fn()]);
    });

    const mockedUseParams = useParams as jest.Mock;
    it("renders Enable Component when user clicks on the Enable UAC Link on home page", () => {

        mockedUseParams.mockReturnValue({ action: "enable" });
        render(
            <MemoryRouter>
                <ManageUacPage />
            </MemoryRouter>
        );
        const viewDisabledCasesButton = screen.getByRole("button", { name: "View Disabled Cases" });
        expect(viewDisabledCasesButton).toBeDefined();
    });

});