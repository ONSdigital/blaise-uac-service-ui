import { Panel, StyledFormField } from "blaise-design-system-react-components";
import { useFormikContext } from "formik";
import { type ReactElement } from "react";

interface FileExistsPageProps {
  questionnaireName: string | undefined;
}

function FileExists({ questionnaireName }: FileExistsPageProps): ReactElement {
  useFormikContext<Record<string, string>>();

  function validateOverwrite(value: string) {
    let error;

    if (!value) {
      error = "Select an option";
    }

    return error;
  }

  const field = {
    name: "overwrite sample",
    description: "Overwrite sample file?",
    type: "radio" as const,
    validate: validateOverwrite,
    radioOptions: [
      {
        id: "Yes",
        label: "Yes, overwrite sample file",
        value: "Yes",
      },
      {
        id: "No",
        label: "No, do not overwrite sample file",
        value: "No",
      },
    ],
    autoFocus: true,
    props: {},
  };

  return (
    <>
      <Panel status="warn">
        <p>
          A sample file already exists for <em className="ons-highlight">{questionnaireName}</em>
        </p>
      </Panel>
      <StyledFormField {...field} />
    </>
  );
}

export default FileExists;
