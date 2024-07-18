/**
 * @jest-environment jsdom
 */
import { fireEvent, render, waitFor } from "@testing-library/react";
import React, { act } from "react";
import { Authenticate } from "blaise-login-react/blaise-login-react-client";
import { createMemoryRouter, RouterProvider, useNavigate } from "react-router-dom";
import flushPromises from "../../utils";
import "@testing-library/jest-dom/extend-expect";
import ReEnableUacSummary from "./ReEnableUacSummary";

describe("ReEnable UAC Summary", () => {

    it("displays a success message when receiving a successful response from the reEnable uac api", () => {

        const props = {
            questionnaireName: "LMS2209_EM1",
            uac: "100461197282",
            case_id: "907195",
            responseStatus: "success"
        };

        const { getByText } = render(<ReEnableUacSummary {...props} />);

        expect(getByText(`Successfully Re-Enabled uac ${props.uac} with Case Id ${props.case_id} for Questionnaire ${props.questionnaireName}`)).toBeInTheDocument();
        expect(getByText(/with Case Id/i)).toBeInTheDocument();
    });

    it("displays an error message when receiving a failed response from the reEnable uac api", () => {

        const props = {
            questionnaireName: "LMS2209_EM1",
            uac: "100461197282",
            case_id: "907195",
            responseStatus: "error"
        };

        const { getByText } = render(<ReEnableUacSummary {...props} />);
        expect(getByText(`Re-Enabling uac ${props.uac} with Case Id ${props.case_id} for Questionnaire ${props.questionnaireName} failed`)).toBeInTheDocument();

    });
});