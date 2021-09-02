import {ONSPanel} from "blaise-design-system-react-components";
import React, {ReactElement} from "react";

interface UploadFailedProps {
    instrumentName: string | undefined;
}

function UploadFailed(props: UploadFailedProps): ReactElement {
    const {instrumentName} = props;

    return (
        <>
            <ONSPanel status="error">
                <h1>File upload failed</h1>
                <p>
                    Sample file for questionnaire <em className="highlight">{instrumentName}</em> has failed to upload.
                </p>
                <p>
                    When reporting this issue to the Service Desk, please provide the questionnaire name, and time and
                    date of the failure.
                </p>
            </ONSPanel>
        </>
    );
}

export default UploadFailed;