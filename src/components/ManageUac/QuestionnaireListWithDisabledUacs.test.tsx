/**
 * @jest-environment jsdom
 */
import { fireEvent, render, screen } from "@testing-library/react";
import React, { act } from "react";
import { Authenticate } from "blaise-login-react/blaise-login-react-client";
import { MemoryRouter, useNavigate } from "react-router-dom";
import { disabledUacCodesForQuestionnaireMock, questionnaireWithDisabledUacsMock } from "../../mocks/api-mocks";
import flushPromises from "../../utils";
import "@testing-library/jest-dom/extend-expect";
import MockAdapter from "axios-mock-adapter";
import { questionnaireListForEnableUacsMock } from "../../mocks/api-mocks";
import axios from "axios";
import QuestionnaireListWithDisabledUacs from "./QuestionnaireListWithDisabledUacs";

// mock login
jest.mock("blaise-login-react/blaise-login-react-client");
const { MockAuthenticate } = jest.requireActual("blaise-login-react/blaise-login-react-client");
Authenticate.prototype.render = MockAuthenticate.prototype.render;
MockAuthenticate.OverrideReturnValues(null, true);

const mock = new MockAdapter(axios);

jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: jest.fn(),
}));
let navigate: jest.Mock;

describe("List of Questionnaires with disabled UACs", () => {
    afterEach(() => {
        mock.reset();
    });

    beforeEach(() => {
        mock.onGet("/api/v1/questionnaires").reply(200, questionnaireListForEnableUacsMock);
        mock.onGet("/api/v1/getDiabledUacs/" + questionnaireListForEnableUacsMock[0].name).reply(200, disabledUacCodesForQuestionnaireMock);
        mock.onGet("/api/v1/getDiabledUacs/" + questionnaireListForEnableUacsMock[1].name).reply(200, {});
    });

    it("renders QuestionnaireListWithDisabledUacs Component when user clicks on the Enable UAC Link on home page", async () => {

        render(
            <MemoryRouter>
                <QuestionnaireListWithDisabledUacs />
            </MemoryRouter>
        );
        await act(async () => {
            await flushPromises();
        });
        const viewDisabledCasesButton = screen.getByRole("button", { name: "View Disabled Cases" });
        expect(viewDisabledCasesButton).toBeDefined();
    });

    it("navigates to EnableUacTable component when user clicks on View Disabled Cases button", async () => {

        navigate = jest.fn();
        (useNavigate as jest.Mock).mockReturnValue(navigate);
        render(
            <MemoryRouter>
                <QuestionnaireListWithDisabledUacs />
            </MemoryRouter>
        );
        await act(async () => {
            await flushPromises();
        });
        const viewDisabledCasesButton = screen.getByRole("button", { name: "View Disabled Cases" });
        expect(viewDisabledCasesButton).toBeDefined();

        act(() => {
            fireEvent.click(screen.getByRole("button", { name: "View Disabled Cases" }));
        });

        expect(navigate).toHaveBeenCalledWith("/listDisabledUacs", {
            state: {
                questionnaireWithDisabledUacs: questionnaireWithDisabledUacsMock,
            },
        });
    });
});