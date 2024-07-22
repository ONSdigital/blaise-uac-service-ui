/**
 * @jest-environment jsdom
 */
import { fireEvent, render } from "@testing-library/react";
import React, { act } from "react";
import { Authenticate } from "blaise-login-react/blaise-login-react-client";
import { BrowserRouter, MemoryRouter, useNavigate, useParams } from "react-router-dom";
import flushPromises from "../../utils";
import "@testing-library/jest-dom/extend-expect";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import DisableUacConfirmation from "./DisableUacConfirmation";
// mock login
jest.mock("blaise-login-react/blaise-login-react-client");
const { MockAuthenticate } = jest.requireActual("blaise-login-react/blaise-login-react-client");
Authenticate.prototype.render = MockAuthenticate.prototype.render;
MockAuthenticate.OverrideReturnValues(null, true);

const mock = new MockAdapter(axios);

jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useParams: jest.fn(),
    useLocation: jest.fn(),
    useNavigate: jest.fn(),
}));
let navigate: jest.Mock;

describe("Disable Confirmation component loads correctly and receives the passed uac from url param", () => {

    const mockedUseParams = useParams as jest.Mock;

    it("renders Disable Confirmation Component and shows a warning message for disabling uac", () => {

        const uac = "123456789123";
        mockedUseParams.mockReturnValue({ uac: uac });
        const { getByText } =
            render(<BrowserRouter>
                <DisableUacConfirmation />
            </BrowserRouter >);

        const expectedText = "Are you sure you want to disable UAC ?";
        expect(getByText(expectedText)).toBeInTheDocument();

    });

});

describe("Disable Confirmation component correctly displays messages when user takes action", () => {

    const mockedUseParams = useParams as jest.Mock;
    afterEach(() => {
        mock.reset();
    });

    it("correctly displays Success Message when User clicks Continue button and api returns Success", async () => {

        const uac = "123456789123";
        mockedUseParams.mockReturnValue({ uac: uac });

        mock.onGet(`/api/v1/disableUac/${uac}`).reply(200, "Success");

        const { getByText, getByRole } = render(
            <MemoryRouter>
                <DisableUacConfirmation />
            </MemoryRouter>
        );

        const continueButton = getByRole("button", { name: "Continue" });
        expect(continueButton).toBeDefined();

        act(() => {
            fireEvent.click(getByRole("button", { name: "Continue" }));
        });
        await act(async () => {
            await flushPromises();
        });
        const expectedSuccessMessageText = `Successfully disabled the UAC ${uac}`;
        expect(getByText(expectedSuccessMessageText)).toBeInTheDocument();
    });

    it("correctly displays Error Message when User clicks Continue button and api returns Error ", async () => {

        const uac = "123456789123";
        mockedUseParams.mockReturnValue({ uac: uac });

        mock.onGet(`/api/v1/disableUac/${uac}`).reply(500, `Disabling UAC: ${uac} failed`);

        const { getByText, getByRole } = render(
            <MemoryRouter>
                <DisableUacConfirmation />
            </MemoryRouter>
        );

        const continueButton = getByRole("button", { name: "Continue" });
        expect(continueButton).toBeDefined();

        act(() => {
            fireEvent.click(getByRole("button", { name: "Continue" }));
        });
        await act(async () => {
            await flushPromises();
        });
        const expectedErrorMessageText = `Some error occured on disabling the UAC ${uac}`;
        expect(getByText(expectedErrorMessageText)).toBeInTheDocument();
    });

    it("correctly navigates back if user clicks Cancel ", async () => {

        navigate = jest.fn();
        (useNavigate as jest.Mock).mockReturnValue(navigate);

        const { getByRole } = render(
            <MemoryRouter>
                <DisableUacConfirmation />
            </MemoryRouter>
        );

        const cancelButton = getByRole("button", { name: "Cancel" });
        expect(cancelButton).toBeDefined();

        act(() => {
            fireEvent.click(getByRole("button", { name: "Cancel" }));
        });
        await act(async () => {
            await flushPromises();
        });
        expect(navigate).toHaveBeenCalledWith(-1);
    });
});