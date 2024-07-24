/**
 * @jest-environment jsdom
 */
import { fireEvent, render, waitFor } from "@testing-library/react";
import React, { act } from "react";
import { Authenticate } from "blaise-login-react/blaise-login-react-client";
import { createMemoryRouter, RouterProvider, useNavigate } from "react-router-dom";
import flushPromises from "../../utils";
import "@testing-library/jest-dom/extend-expect";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import ReEnableUacConfirmation from "./ReEnableUacConfirmation";
import ManageUacPage from "./ManageUacPage";

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

const confirmationComponentState = { questionnaireName: "LMS2209_EM1", uac: "100461197282", case_id: "907195" };

describe("ReEnable Confirmation component", () => {

    const routes = [
        {
            path: "/reEnableUacConfirmation",
            element: <ReEnableUacConfirmation />,
        },
    ];

    const initialEntries = [
        {
            pathname: "/reEnableUacConfirmation",
            state: confirmationComponentState,
        },
    ];

    it("renders ReEnable Confirmation Component and receives the passed state", async () => {

        const router = createMemoryRouter(routes, {
            initialEntries,
            initialIndex: 0,
        });

        const { getByText } = render(<RouterProvider router={router} />);

        await act(async () => {
            await flushPromises();
        });

        const expectedWarningMessageText = "Are you sure you want to enable UAC ?";
        expect(getByText(expectedWarningMessageText)).toBeInTheDocument();
        expect(getByText("LMS2209_EM1")).toBeInTheDocument();
    });

});

describe("ReEnable Confirmation Component correctly displays messages when user takes action and navigates correctly", () => {
    const navigate: jest.Mock = jest.fn();

    beforeEach(() => {
        mock.reset();
        navigate.mockReset();
    });

    const manageUacPageSuccessState = { questionnaireName: "LMS2209_EM1", uac: "100461197282", case_id: "907195", responseStatus: "success" };
    const manageUacPageFailedState = { questionnaireName: "LMS2209_EM1", uac: "100461197282", case_id: "907195", responseStatus: "error" };

    const routes = [
        {
            path: "/reEnableUacConfirmation",
            element: <ReEnableUacConfirmation />,
        },
        {
            path: "/manageUac/enable",
            element: <ManageUacPage />,
        }
    ];

    const initialEntries = [
        {
            pathname: "/reEnableUacConfirmation",
            state: confirmationComponentState,
        }
    ];
    const router = createMemoryRouter(routes, {
        initialEntries,
        initialIndex: 0,
    });

    it("renders ReEnable Confirmation Component and navigates to manageUac Page Component (Enable view) passing new state with success api response status ", async () => {
        (useNavigate as jest.Mock).mockReturnValue(navigate);

        mock.onGet(`/api/v1/enableUac/${confirmationComponentState.uac}`).reply(200, "Success");

        const { getByRole } = render(<RouterProvider router={router} />);

        const continueButton = getByRole("button", { name: "Continue" });
        expect(continueButton).toBeDefined();

        act(() => {
            fireEvent.click(continueButton);
        });

        await waitFor(() => {
            expect(navigate).toHaveBeenCalledWith("/manageUac/enable", { state: manageUacPageSuccessState });
        });

    });

    it("renders ReEnable Confirmation Component and navigates to manageUac Page Component (Enable view) passing new state with failed api response status ", async () => {

        (useNavigate as jest.Mock).mockReturnValue(navigate);

        mock.onGet(`/api/v1/enableUac/${confirmationComponentState.uac}`).reply(500, `Enabling UAC: ${confirmationComponentState.uac} failed`);

        const { getByRole } = render(<RouterProvider router={router} />);

        const continueButton = getByRole("button", { name: "Continue" });
        expect(continueButton).toBeDefined();

        act(() => {
            fireEvent.click(continueButton);
        });

        await waitFor(() => {
            expect(navigate).toHaveBeenCalledWith("/manageUac/enable", { state: manageUacPageFailedState });
        });

    });

    it("renders ReEnable Confirmation Component and navigates back if user Clicks Cancel", async () => {

        const { getByRole } = render(<RouterProvider router={router} />);

        const cancelButton = getByRole("button", { name: "Cancel" });
        expect(cancelButton).toBeDefined();

        act(() => {
            fireEvent.click(cancelButton);
        });

        await waitFor(() => {
            expect(navigate).toHaveBeenCalledWith(-1);
        });

    });

});

