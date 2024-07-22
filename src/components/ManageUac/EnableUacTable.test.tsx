/**
 * @jest-environment jsdom
 */
import { fireEvent, render } from "@testing-library/react";
import React, { act } from "react";
import { Authenticate } from "blaise-login-react/blaise-login-react-client";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import "@testing-library/jest-dom";
import flushPromises from "../../utils";
import { questionnaireWithDisabledUacsMock, questionnaireWithOneDisabledUacMock } from "../../mocks/api-mocks";
import EnableUacTable from "./EnableUacTable";
import ReEnableUacConfirmation from "./ReEnableUacConfirmation";

jest.mock("./QuestionnaireListWithDisabledUacs");

jest.mock("axios");

// mock login
jest.mock("blaise-login-react/blaise-login-react-client");
const { MockAuthenticate } = jest.requireActual("blaise-login-react/blaise-login-react-client");
Authenticate.prototype.render = MockAuthenticate.prototype.render;

describe("Disable UAC page works as expected", () => {

    MockAuthenticate.OverrideReturnValues(null, true);

    it("displays the correct content on navigating to list Disabled UACs for a questionnaire in table", async () => {

        const initialEntries = [
            { pathname: "/listDisabledUacs", state: { questionnaireWithDisabledUacs: questionnaireWithDisabledUacsMock } }
        ];

        const { getByText } = render(
            <MemoryRouter initialEntries={initialEntries}>
                <Routes>
                    <Route path="/listDisabledUacs" Component={EnableUacTable} />
                </Routes>
            </MemoryRouter>
        );
        await act(async () => {
            await flushPromises();
        });
        expect(getByText(questionnaireWithDisabledUacsMock.questionnaireName)).toBeInTheDocument();
        expect(getByText("Disabled UACs for")).toBeInTheDocument();
        expect(getByText("CaseID")).toBeDefined();
        expect(getByText("UAC")).toBeDefined();
        expect(getByText("Enable")).toBeDefined();

    });

    it("navigates to the ReEnable UAC Confirmation component when user clicks on the Enable UAC Link", async () => {

        const initialEntries = [
            { pathname: "/listDisabledUacs", state: { questionnaireWithDisabledUacs: questionnaireWithOneDisabledUacMock } }
        ];

        const { getByRole, getByText } = render(
            <MemoryRouter initialEntries={initialEntries}>
                <Routes>
                    <Route path="/listDisabledUacs" Component={EnableUacTable} />
                    <Route path="/reEnableUacConfirmation" Component={ReEnableUacConfirmation} />
                </Routes>
            </MemoryRouter>
        );
        await act(async () => {
            await flushPromises();
        });

        const tableElement = getByRole("table");
        expect(tableElement).toBeInTheDocument();

        const bodyRows = tableElement.querySelectorAll("tbody > tr");
        expect(bodyRows).toHaveLength(1);

        const cells = bodyRows[0].querySelectorAll("td");
        expect(cells).toHaveLength(3);
        expect(cells[0].textContent).toStrictEqual(questionnaireWithOneDisabledUacMock.disabledUacs[0].case_id);
        expect(cells[1].textContent).toStrictEqual(questionnaireWithOneDisabledUacMock.disabledUacs[0].uac);
        expect(cells[2].textContent).toStrictEqual("Enable UAC");

        const link = getByText("Enable UAC");
        act(() => {
            fireEvent.click(link);
        });
        await act(async () => {
            await flushPromises();
        });
        expect(getByText("Are you sure you want to enable ?")).toBeDefined();
        expect(getByText(questionnaireWithOneDisabledUacMock.disabledUacs[0].case_id)).toBeDefined();
        expect(getByText(questionnaireWithOneDisabledUacMock.disabledUacs[0].uac)).toBeDefined();

    });

});