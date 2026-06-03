import { ExternalLink, Panel } from "blaise-design-system-react-components";
import { type ReactElement } from "react";

import csvUploadErrorMessage, {
  getMissingCsvColumn,
  isKnownCsvValidationIssue,
} from "../../shared/csvUploadErrorMessage";

import type { AxiosError } from "axios";

interface UploadFailedProps {
  questionnaireName: string | undefined;
  error: Error | AxiosError | undefined;
}

function UploadFailed({ questionnaireName, error }: UploadFailedProps): ReactElement {
  const errorMessage = csvUploadErrorMessage(error);
  const showServiceDeskAdvice = !isKnownCsvValidationIssue(errorMessage);
  const missingColumn = getMissingCsvColumn(errorMessage);

  return (
    <>
      <Panel status="error">
        <h1>File upload failed</h1>
        <p>
          The sample file for questionnaire <em className="ons-highlight">{questionnaireName}</em>{" "}
          failed to upload.
        </p>
        {showServiceDeskAdvice && (
          <p>
            Please report this issue to{" "}
            <ExternalLink
              text="Service Desk"
              link="https://ons.service-now.com/"
            />{" "}
            and include the questionnaire name and the date and time of failure.
          </p>
        )}
      </Panel>
      {errorMessage && (
        <Panel status="error">
          {missingColumn ? (
            <p>
              Column <em className="ons-highlight">{missingColumn}</em> is not in the CSV file.
              Column names are case sensitive.
            </p>
          ) : (
            <p>{errorMessage}</p>
          )}
        </Panel>
      )}
    </>
  );
}

export default UploadFailed;
