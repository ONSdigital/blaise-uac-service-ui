/**
 * @jest-environment jsdom
 */
import { fireEvent, render, screen } from "@testing-library/react";
import React, { act } from "react";
import { Authenticate } from "blaise-login-react/blaise-login-react-client";
import { createMemoryRouter, RouterProvider, useNavigate } from "react-router-dom";
import "@testing-library/jest-dom";
import flushPromises from "../../utils";

import DisableUac from "./DisableUac";

jest.mock("./QuestionnaireListWithDisabledUacs");

jest.mock("axios");

jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: jest.fn()
}));

// mock login
jest.mock("blaise-login-react/blaise-login-react-client");
const { MockAuthenticate } = jest.requireActual("blaise-login-react/blaise-login-react-client");
Authenticate.prototype.render = MockAuthenticate.prototype.render;

let navigate: jest.Mock;
describe("Disable UAC page works as expected", async () => {

    beforeEach(() => {
        navigate = jest.fn();
    });

    MockAuthenticate.OverrideReturnValues(null, true);

    const disabledComponentInitialState = {
        disabledUac: "",
        responseCode: 0
    };
    const routes = [
        {
            path: "/manageUac/disabled",
            element: <DisableUac />,
        },
    ];

    const initialEntries = [
        {
            pathname: "/manageUac/disabled",
            state: disabledComponentInitialState,
        },
    ];

    it("displays the correct content on landing in Disable UAC view", async () => {

        const router = createMemoryRouter(routes, {
            initialEntries,
            initialIndex: 0,
        });

        const { getByText } = render(<RouterProvider router={router} />);

        await act(async () => {
            await flushPromises();
        });

        expect(getByText("Disable UAC")).toBeDefined();
        expect(getByText("Enter UAC")).toBeDefined();
        expect(screen.getByPlaceholderText("Enter 12 digit UAC")).toBeDefined();

    });

    it("disable UAC button is disabled by default", async () => {

        const router = createMemoryRouter(routes, {
            initialEntries,
            initialIndex: 0,
        });

        const { getByRole } = render(<RouterProvider router={router} />);

        await act(async () => {
            await flushPromises();
        });

        const button = getByRole("button", { name: "Disable UAC" });
        expect(button).toBeDisabled();
    });

    it("disable UAC button is enabled if text field is 12 digits long", async () => {

        const router = createMemoryRouter(routes, {
            initialEntries,
            initialIndex: 0,
        });

        const { getByRole } = render(<RouterProvider router={router} />);

        await act(async () => {
            await flushPromises();
        });
        const disableUACButton = getByRole("button", { name: "Disable UAC" });
        expect(disableUACButton).toBeDisabled();

        const uacInput = screen.getByPlaceholderText("Enter 12 digit UAC");
        fireEvent.change(uacInput, { target: { value: "123456789123" } });

        expect(disableUACButton).toBeEnabled();
    });

    it("disable UAC button remains disabled if text field is not 12 digits long", async () => {

        const router = createMemoryRouter(routes, {
            initialEntries,
            initialIndex: 0,
        });

        const { getByRole } = render(<RouterProvider router={router} />);

        await act(async () => {
            await flushPromises();
        });
        const disableUACButton = getByRole("button", { name: "Disable UAC" });
        expect(disableUACButton).toBeDisabled();

        const uacInput = screen.getByPlaceholderText("Enter 12 digit UAC");
        fireEvent.change(uacInput, { target: { value: "12345678912" } });

        expect(disableUACButton).toBeDisabled();
    });

    it("disable UAC button remains disabled if text field contains alphabets", async () => {

        const router = createMemoryRouter(routes, {
            initialEntries,
            initialIndex: 0,
        });

        const { getByRole } = render(<RouterProvider router={router} />);

        await act(async () => {
            await flushPromises();
        });

        const disableUACButton = getByRole("button", { name: "Disable UAC" });
        expect(disableUACButton).toBeDisabled();

        const uacInput = screen.getByPlaceholderText("Enter 12 digit UAC");
        fireEvent.change(uacInput, { target: { value: "12345678912a" } });

        expect(disableUACButton).toBeDisabled();
    });

    it("correctly shows the message to the user if length of uac exceeds and keeps the button disabled", async () => {

        const router = createMemoryRouter(routes, {
            initialEntries,
            initialIndex: 0,
        });

        const { getByText, getByRole } = render(<RouterProvider router={router} />);

        await act(async () => {
            await flushPromises();
        });

        const invalid_uac = "1234567891234";
        const uacInput = screen.getByPlaceholderText("Enter 12 digit UAC");
        fireEvent.change(uacInput, { target: { value: invalid_uac } });

        expect(getByText("The UAC input needs to be 12 digits long")).toBeDefined();

        const disableUACButton = getByRole("button", { name: "Disable UAC" });
        expect(disableUACButton).toBeDisabled();
    });

    it("correctly shows the message to the user if user enters alphabet and keeps the button disabled", async () => {

        const router = createMemoryRouter(routes, {
            initialEntries,
            initialIndex: 0,
        });

        const { getByText, getByRole } = render(<RouterProvider router={router} />);

        await act(async () => {
            await flushPromises();
        });

        const invalid_uac = "12345abc";
        const uacInput = screen.getByPlaceholderText("Enter 12 digit UAC");
        fireEvent.change(uacInput, { target: { value: invalid_uac } });

        expect(getByText("The UAC input can only contain digits")).toBeDefined();

        const disableUACButton = getByRole("button", { name: "Disable UAC" });
        expect(disableUACButton).toBeDisabled();
    });

    it("navigates correctly to the right url i-e, Confirmation screen on clicking disable UAC button", async () => {

        (useNavigate as jest.Mock).mockReturnValue(navigate);

        const router = createMemoryRouter(routes, {
            initialEntries,
            initialIndex: 0,
        });

        const { getByRole } = render(<RouterProvider router={router} />);

        await act(async () => {
            await flushPromises();
        });

        const uac = "123456789123";
        const uacInput = screen.getByPlaceholderText("Enter 12 digit UAC");
        fireEvent.change(uacInput, { target: { value: uac } });

        const disableUACButton = getByRole("button", { name: "Disable UAC" });
        fireEvent.click(disableUACButton);

        expect(navigate).toHaveBeenCalledWith(`/disableUacConfirmation/${uac}`);
    });

});

describe("Disable UAC page correctly displays Response from API call to disable UAC", async () => {

    beforeEach(() => {
        navigate = jest.fn();
    });

    MockAuthenticate.OverrideReturnValues(null, true);

    const disabledComponentStateWithSuccessDisableReponse = {
        disabledUac: "100461197284",
        responseCode: 200
    };

    const disabledComponentStateWithErrorDisableReponse = {
        disabledUac: "100461197282",
        responseCode: 500
    };

    it("displays the Success Panel for disabling the UAC on landing in Disable UAC view if returned from DisableConfirmationComponent", async () => {

        const routes = [
            {
                path: "/manageUac/disabled",
                element: <DisableUac />,
            },
        ];

        const initialEntries = [
            {
                pathname: "/manageUac/disabled",
                state: disabledComponentStateWithSuccessDisableReponse,
            },
        ];
        const router = createMemoryRouter(routes, {
            initialEntries,
            initialIndex: 0,
        });

        const { getByText } = render(<RouterProvider router={router} />);

        await act(async () => {
            await flushPromises();
        });

        expect(getByText(`Successfully disabled the UAC ${disabledComponentStateWithSuccessDisableReponse.disabledUac}`)).toBeDefined();

    });

    it("displays the Error Panel for disabling the UAC on landing in Disable UAC view if returned from DisableConfirmationComponent", async () => {

        const routes = [
            {
                path: "/manageUac/disabled",
                element: <DisableUac />,
            },
        ];

        const initialEntries = [
            {
                pathname: "/manageUac/disabled",
                state: disabledComponentStateWithErrorDisableReponse,
            },
        ];
        const router = createMemoryRouter(routes, {
            initialEntries,
            initialIndex: 0,
        });

        const { getByText } = render(<RouterProvider router={router} />);

        await act(async () => {
            await flushPromises();
        });

        expect(getByText(`Some error occured on disabling the UAC ${disabledComponentStateWithErrorDisableReponse.disabledUac}`)).toBeDefined();

    });

});