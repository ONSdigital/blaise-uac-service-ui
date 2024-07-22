/**
 * @jest-environment jsdom
 */
import { render } from "@testing-library/react";
import React from "react";
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

        expect(getByText(`Successfully enabled UAC ${props.uac} with case Id ${props.case_id} for questionnaire ${props.questionnaireName}`)).toBeInTheDocument();
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
        expect(getByText(`Enabling UAC ${props.uac} with case Id ${props.case_id} for questionnaire ${props.questionnaireName} failed`)).toBeInTheDocument();

    });
});