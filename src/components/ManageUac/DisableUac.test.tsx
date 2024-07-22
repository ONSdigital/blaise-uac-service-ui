/**
 * @jest-environment jsdom
 */
import { fireEvent, render, screen } from "@testing-library/react";
import React, { act } from "react";
import { Authenticate } from "blaise-login-react/blaise-login-react-client";
import { useNavigate } from "react-router-dom";
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

    it("displays the correct content on landing in Disable UAC view", () => {

        const { getByText } = render(<DisableUac />);

        expect(getByText("Disable UAC")).toBeDefined();
        expect(getByText("Enter UAC")).toBeDefined();
        expect(screen.getByPlaceholderText("Enter 12 digit UAC")).toBeDefined();

    });

    it("Disable UAC button is disabled by default", () => {

        render(<DisableUac />);
        const button = screen.getByRole("button", { name: "Disable UAC" });
        expect(button).toBeDisabled();
    });

    it("Disable UAC button is enabled if text field is 12 digits long", async () => {

        render(<DisableUac />);
        await act(async () => {
            await flushPromises();
        });
        const disableUACButton = screen.getByRole("button", { name: "Disable UAC" });
        expect(disableUACButton).toBeDisabled();

        const uacInput = screen.getByPlaceholderText("Enter 12 digit UAC");
        fireEvent.change(uacInput, { target: { value: "123456789123" } });

        // Assert that the button is enabled after input
        expect(disableUACButton).toBeEnabled();
    });

    it("Disable UAC button remains disabled if text field is not 12 digits long", async () => {

        render(<DisableUac />);
        await act(async () => {
            await flushPromises();
        });
        const disableUACButton = screen.getByRole("button", { name: "Disable UAC" });
        expect(disableUACButton).toBeDisabled();

        const uacInput = screen.getByPlaceholderText("Enter 12 digit UAC");
        fireEvent.change(uacInput, { target: { value: "12345678912" } });

        // Assert that the button is enabled after input
        expect(disableUACButton).toBeDisabled();
    });

    it("Disable UAC button remains disabled if text field contains alphabets", async () => {

        render(<DisableUac />);
        await act(async () => {
            await flushPromises();
        });
        const disableUACButton = screen.getByRole("button", { name: "Disable UAC" });
        expect(disableUACButton).toBeDisabled();

        const uacInput = screen.getByPlaceholderText("Enter 12 digit UAC");
        fireEvent.change(uacInput, { target: { value: "12345678912a" } });

        // Assert that the button is enabled after input
        expect(disableUACButton).toBeDisabled();
    });

    it("correctly shows the message to the user if length of uac exceeds and keeps the button disabled", async () => {

        const { getByText } = render(<DisableUac />);
        await act(async () => {
            await flushPromises();
        });

        const invalid_uac = "1234567891234";
        const uacInput = screen.getByPlaceholderText("Enter 12 digit UAC");
        fireEvent.change(uacInput, { target: { value: invalid_uac } });

        expect(getByText("The UAC input needs to be 12 digits long")).toBeDefined();

        const disableUACButton = screen.getByRole("button", { name: "Disable UAC" });
        expect(disableUACButton).toBeDisabled();
    });

    it("correctly shows the message to the user if user enters alphabet and keeps the button disabled", async () => {

        const { getByText } = render(<DisableUac />);
        await act(async () => {
            await flushPromises();
        });

        const invalid_uac = "12345abc";
        const uacInput = screen.getByPlaceholderText("Enter 12 digit UAC");
        fireEvent.change(uacInput, { target: { value: invalid_uac } });

        expect(getByText("The UAC input can only contain digits")).toBeDefined();

        const disableUACButton = screen.getByRole("button", { name: "Disable UAC" });
        expect(disableUACButton).toBeDisabled();
    });

    it("Navigates correctly to the right url i-e, Confirmation screen on clicking disable UAC button", async () => {

        (useNavigate as jest.Mock).mockReturnValue(navigate);

        render(<DisableUac />);
        await act(async () => {
            await flushPromises();
        });

        const uac = "123456789123";
        const uacInput = screen.getByPlaceholderText("Enter 12 digit UAC");
        fireEvent.change(uacInput, { target: { value: uac } });

        const disableUACButton = screen.getByRole("button", { name: "Disable UAC" });
        fireEvent.click(disableUACButton);

        expect(navigate).toHaveBeenCalledWith(`/disableUacConfirmation/${uac}`);
    });
});