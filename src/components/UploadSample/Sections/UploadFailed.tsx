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
                    Sample file for questionnaire <em className="highlight">{instrumentName}</em> has failed to deploy.
                </p>
                <p>
                    When reporting the issue to Service Desk provide the questionnaire name, time and date of failure.
                </p>
            </ONSPanel>
        </>
    );
}

export default UploadFailed;