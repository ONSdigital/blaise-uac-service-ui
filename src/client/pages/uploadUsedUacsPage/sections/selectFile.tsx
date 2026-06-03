import { Panel, Upload } from "blaise-design-system-react-components";
import { type ReactElement } from "react";

interface SelectFilePageProps {
  file: File | undefined;
  setFile: (file: File) => void;
  isSubmitting: boolean;
  validationError?: string;
}

function SelectFile({
  file: _file,
  setFile,
  isSubmitting,
  validationError,
}: SelectFilePageProps): ReactElement {
  const handleFileChange = (selectorFiles: FileList | null) => {
    if (selectorFiles && selectorFiles.length === 1) {
      setFile(selectorFiles[0]);
    }
  };

  return (
    <>
      <div className="ons-grid">
        <div className="ons-grid__col ons-col-8@m">
          <h1>Which used UAC file do you want to upload?</h1>
          <Panel>
            <p>
              The UAC file must be a CSV containing the column{" "}
              <em className="ons-highlight">UAC</em>.
            </p>
            <p>
              Upload UACs that were generated outside this service or the Deploy Questionnaire
              Service (DQS). Uploading these UACs marks them as used, so they will not be generated
              again.
            </p>
            <p>Upload may take a few minutes. Do not navigate away from this page.</p>
          </Panel>
          <div className="ons-field">
            {validationError && (
              <div
                className="ons-panel ons-panel--error ons-panel--no-title"
                id="uac-selector-error"
              >
                <span className="ons-panel__assistive-text ons-u-vh">Error: </span>
                <div className="ons-panel__body">
                  <p className="ons-panel__error">
                    <strong>{validationError}</strong>
                  </p>
                </div>
              </div>
            )}
            <Upload
              label="Select a UAC file"
              description="Accepted file type: csv"
              id="uac-selector"
              accept=".csv"
              disabled={isSubmitting}
              onChange={(e, _value) => handleFileChange(e.target.files)}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default SelectFile;
