import React, { ChangeEvent, ReactElement } from "react";
import { StyledFormErrorSummary, StyledFormField } from "blaise-design-system-react-components";

interface ConfirmName {
  instrumentName: string;
  setNameConfirmation: React.Dispatch<React.SetStateAction<boolean>>;
}

function ConfirmName({ instrumentName, setNameConfirmation }: ConfirmName): ReactElement {

  function validateRadio(value: string) {
    let error;
    if (!value) {
      error = "Select an option";
    }
    return error;
  }

  function isConfirm(event: ChangeEvent<HTMLInputElement>): boolean {
    return event.target.value === "confirm";
  }

  const field = {
    name: "confirm",
    description: "",
    type: "radio",
    autoFocus: true,
    validate: validateRadio,
    onClick: (event: ChangeEvent<HTMLInputElement>) => setNameConfirmation(isConfirm(event)),
    radioOptions: [
      { id: "yes", label: "Yes, the questionnaire name is correct", value: "confirm" },
      { id: "cancel", label: "No, I need to amend it", value: "cancel" },
    ]
  };

  return (
    <>
      <h1 className="u-mb-l">
        Can you confirm <em className="highlight">{instrumentName}</em> is the correct questionnaire name?
      </h1>

      <StyledFormErrorSummary />

      <StyledFormField {...field} />
    </>
  );
}

export default ConfirmName;
