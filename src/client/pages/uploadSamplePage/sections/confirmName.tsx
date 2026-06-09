import { StyledFormField } from "blaise-design-system-react-components";
import { type ReactElement } from "react";

interface ConfirmName {
  questionnaireName: string;
}

function ConfirmName({ questionnaireName }: ConfirmName): ReactElement {
  function validateRadio(value: string) {
    let error;

    if (!value) {
      error = "Select an option";
    }

    return error;
  }

  const field = {
    name: "confirm",
    description: "",
    type: "radio" as const,
    autoFocus: true,
    validate: validateRadio,
    radioOptions: [
      { id: "yes", label: "Yes, that's correct", value: "yes" },
      { id: "no", label: "No, I need to change it", value: "no" },
    ],
    props: {},
  };

  return (
    <>
      <h1 className="ons-u-mb-l">
        Is <em className="ons-highlight">{questionnaireName}</em> the correct questionnaire name?
      </h1>

      <StyledFormField {...field} />
    </>
  );
}

export default ConfirmName;
