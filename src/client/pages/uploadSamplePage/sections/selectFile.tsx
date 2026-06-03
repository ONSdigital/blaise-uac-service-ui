import { Panel, Upload } from "blaise-design-system-react-components";
import { Field, type FieldProps, type FormikContextType, useFormikContext } from "formik";
import { type ReactElement } from "react";

interface SelectFilePageProps {
  file: File | undefined;
  setFile: (file: File) => void;
}

function SelectFile(props: SelectFilePageProps): ReactElement {
  const { file, setFile } = props;
  const { isSubmitting }: FormikContextType<unknown> = useFormikContext();

  function validateInput() {
    let error;

    if (!file) {
      error = "Select a file";
    } else if (!file.name.endsWith(".csv")) {
      error = "File must be a .csv";
    }

    return error;
  }

  const handleFileChange = (selectorFiles: FileList | null) => {
    if (selectorFiles && selectorFiles.length === 1) {
      setFile(selectorFiles[0]);
    }
  };

  return (
    <>
      <div className="ons-grid">
        <div className="ons-grid__col ons-col-8@m">
          <h1>Upload a sample file</h1>
          <Panel>
            <p>
              The sample file must be a CSV containing the column{" "}
              <em className="ons-highlight">serial_number</em>.
            </p>
            <p>Upload may take a few minutes. Do not navigate away from this page.</p>
          </Panel>
          <Field
            name="Select a sample file"
            validate={validateInput}
          >
            {({ field: formikField, meta }: FieldProps) => (
              <>
                {meta.error && (
                  <div
                    className="ons-panel ons-panel--error ons-panel--no-title"
                    id="sample-selector-error"
                  >
                    <span className="ons-panel__assistive-text ons-u-vh">Error: </span>
                    <div className="ons-panel__body">
                      <p className="ons-panel__error">
                        <strong>{meta.error}</strong>
                      </p>
                    </div>
                  </div>
                )}
                <Upload
                  label="Select a sample file"
                  description="Accepted file type: csv"
                  id="sample-selector"
                  accept=".csv"
                  disabled={isSubmitting}
                  onChange={(e, _value) => {
                    formikField.onChange(e);
                    handleFileChange(e.target.files);
                  }}
                />
              </>
            )}
          </Field>
        </div>
      </div>
    </>
  );
}

export default SelectFile;
