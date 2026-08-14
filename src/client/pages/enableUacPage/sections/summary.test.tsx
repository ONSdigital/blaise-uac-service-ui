import { render } from "@testing-library/react";

import "@testing-library/jest-dom/vitest";
import Summary from "./summary";

describe("Enable UAC Summary", () => {
  it("displays a success message when receiving a successful response from the enable uac api", () => {
    const props = {
      questionnaireName: "LMS2209_EM1",
      case_id: "907195",
      responseStatus: "success",
    };

    const { getByText } = render(<Summary {...props} />);

    expect(getByText("UAC has been enabled.")).toBeInTheDocument();
    expect(getByText(props.questionnaireName)).toBeInTheDocument();
    expect(getByText(props.case_id)).toBeInTheDocument();
  });

  it("displays an error message when receiving a failed response from the enable uac api", () => {
    const props = {
      questionnaireName: "LMS2209_EM1",
      case_id: "907195",
      responseStatus: "error",
    };

    const { getByText } = render(<Summary {...props} />);

    expect(getByText("Failed to enable UAC.")).toBeInTheDocument();
    expect(getByText(props.questionnaireName)).toBeInTheDocument();
    expect(getByText(props.case_id)).toBeInTheDocument();
  });
});
