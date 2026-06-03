import { Panel, TextInput } from "blaise-design-system-react-components";
import { Field, type FieldProps } from "formik";
import { type ReactElement } from "react";

import { isValidQuestionnaireName } from "../validation";

interface SelectFilePageProps {
  questionnaireName: string | undefined;
  setQuestionnaireName: (string: string) => void;
}

function QuestionnaireName(props: SelectFilePageProps): ReactElement {
  const { questionnaireName, setQuestionnaireName } = props;

  function validateQuestionnaireName() {
    if (!isValidQuestionnaireName(questionnaireName)) {
      return "Enter a valid questionnaire name, e.g. OPN2101A.";
    }
  }

  return (
    <>
      <div className="ons-grid">
        <div className="ons-grid__col ons-col-8@m">
          <h1>Which questionnaire needs UACs generated?</h1>
          <Panel>
            <p>
              The questionnaire name must match the name of the questionnaire deployed via the
              Deploy Questionnaire Service (DQS).
            </p>
            <p>
              The questionnaire name must start with 3 letters for the survey TLA followed by 4
              numbers for the questionnaire field period, e.g. OPN2101A.
            </p>
          </Panel>
          <Field
            name="questionnaire name"
            validate={validateQuestionnaireName}
          >
            {({ field: formikField, meta }: FieldProps) => (
              <div className="ons-field">
                {meta.error && (
                  <div
                    className="ons-panel ons-panel--error ons-panel--no-title"
                    id="questionnaire-name-error"
                  >
                    <span className="ons-panel__assistive-text ons-u-vh">Error: </span>
                    <div className="ons-panel__body">
                      <p className="ons-panel__error">
                        <strong>{meta.error}</strong>
                      </p>
                    </div>
                  </div>
                )}
                <TextInput
                  id="questionnaire-name-input"
                  label="Questionnaire name"
                  autoFocus={true}
                  value={questionnaireName ?? ""}
                  onChange={(e, _value) => {
                    formikField.onChange(e);
                    setQuestionnaireName(e.target.value);
                  }}
                />
              </div>
            )}
          </Field>
        </div>
      </div>
    </>
  );
}

export default QuestionnaireName;
