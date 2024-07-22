/**
 * @jest-environment jsdom
 */
import { fireEvent, render, screen } from "@testing-library/react";
import React, { act } from "react";
import { Authenticate } from "blaise-login-react/blaise-login-react-client";
import { BrowserRouter, MemoryRouter, useLocation, useNavigate, useParams } from "react-router-dom";
import ManageUacPage from "./ManageUacPage";
import { disabledUacCodesForQuestionnaireMock, questionnaireWithDisabledUacsMock } from "../../mocks/api-mocks";
import flushPromises from "../../utils";
import "@testing-library/jest-dom/extend-expect";

// mock login
jest.mock("blaise-login-react/blaise-login-react-client");
const { MockAuthenticate } = jest.requireActual("blaise-login-react/blaise-login-react-client");
Authenticate.prototype.render = MockAuthenticate.prototype.render;
MockAuthenticate.OverrideReturnValues(null, true);
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { questionnaireListForEnableUacsMock } from "../../mocks/api-mocks";
const mock = new MockAdapter(axios);

jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useParams: jest.fn(),
    useLocation: jest.fn(),
    useNavigate: jest.fn(),
}));
let navigate: jest.Mock;

describe("Manage UAC Page correctly displays the disable UAC component when user clicks on Disable UAC Link", () => {

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

        const uacInput = screen.getByPlaceholderText("Enter 12 digit UAC");
        expect(uacInput).toBeDefined();
    });

});

describe("Manage UAC Page correctly displays the enable UAC component when user clicks on Enable UAC Link", () => {
    afterEach(() => {
        mock.reset();
    });

    beforeEach(() => {
        mock.onGet("/api/v1/questionnaires").reply(200, questionnaireListForEnableUacsMock);
        mock.onGet("/api/v1/getDiabledUacs/" + questionnaireListForEnableUacsMock[0].name).reply(200, disabledUacCodesForQuestionnaireMock);
        mock.onGet("/api/v1/getDiabledUacs/" + questionnaireListForEnableUacsMock[1].name).reply(200, {});
    });

    const mockedUseParams = useParams as jest.Mock;

    it("renders Enable Component when user clicks on the Enable UAC Link on home page", async () => {

        mockedUseParams.mockReturnValue({ action: "enable" });
        render(
            <MemoryRouter>
                <ManageUacPage />
            </MemoryRouter>
        );
        await act(async () => {
            await flushPromises();
        });
        const viewDisabledCasesButton = screen.getByRole("button", { name: "View Disabled Cases" });
        expect(viewDisabledCasesButton).toBeDefined();
    });

    it("renders Enable Component when user clicks on the Enable UAC Link on home page", async () => {

        navigate = jest.fn();
        mockedUseParams.mockReturnValue({ action: "enable" });
        (useNavigate as jest.Mock).mockReturnValue(navigate);
        render(
            <MemoryRouter>
                <ManageUacPage />
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