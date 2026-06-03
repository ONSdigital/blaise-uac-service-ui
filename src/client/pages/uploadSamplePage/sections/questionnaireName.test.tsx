import "@testing-library/jest-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Form, Formik } from "formik";
import { act } from "react";

import QuestionnaireName from "./questionnaireName";

function renderComponent(questionnaireName: string | undefined, setQuestionnaireName = vi.fn()) {
  return render(
    <Formik
      initialValues={{ "questionnaire name": questionnaireName ?? "" }}
      onSubmit={vi.fn()}
    >
      <Form>
        <QuestionnaireName
          questionnaireName={questionnaireName}
          setQuestionnaireName={setQuestionnaireName}
        />
        <button type="submit">Continue</button>
      </Form>
    </Formik>,
  );
}

describe("QuestionnaireName", () => {
  it("renders an empty input when the questionnaire name is undefined", () => {
    renderComponent(undefined);

    expect(screen.getByLabelText("Questionnaire name")).toHaveValue("");
  });

  it("calls setQuestionnaireName when the user changes the input", () => {
    const setQuestionnaireName = vi.fn();

    renderComponent(undefined, setQuestionnaireName);

    act(() => {
      fireEvent.change(screen.getByLabelText("Questionnaire name"), {
        target: { value: "DST1234A" },
      });
    });

    expect(setQuestionnaireName).toHaveBeenCalledWith("DST1234A");
  });

  it("shows a validation error for an invalid questionnaire name", async () => {
    renderComponent("invalid");

    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    await waitFor(() => {
      expect(
        screen.getByText("Enter a valid questionnaire name, e.g. OPN2101A."),
      ).toBeInTheDocument();
    });
  });

  it("does not show a validation error for a valid questionnaire name", async () => {
    renderComponent("DST1234A");

    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    await waitFor(() => {
      expect(screen.queryByText("Enter a valid questionnaire name, e.g. OPN2101A.")).toBeNull();
    });
  });
});
