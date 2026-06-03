import { render } from "@testing-library/react";

import "@testing-library/jest-dom/vitest";
import Summary from "./summary";

describe("Enable UAC Summary", () => {
  it("displays a success message when receiving a successful response from the enable uac api", () => {
    const props = {
      questionnaireName: "LMS2209_EM1",
      uac: "100461197282",
      case_id: "907195",
      responseStatus: "success",
    };

    const { getByText } = render(<Summary {...props} />);

    expect(
      getByText(
        `UAC ${props.uac} has been enabled for case ${props.case_id} in ${props.questionnaireName}`,
      ),
    ).toBeInTheDocument();
  });

  it("displays an error message when receiving a failed response from the enable uac api", () => {
    const props = {
      questionnaireName: "LMS2209_EM1",
      uac: "100461197282",
      case_id: "907195",
      responseStatus: "error",
    };

    const { getByText } = render(<Summary {...props} />);

    expect(
      getByText(
        `Failed to enable UAC ${props.uac} for case ${props.case_id} in ${props.questionnaireName}`,
      ),
    ).toBeInTheDocument();
  });
});
