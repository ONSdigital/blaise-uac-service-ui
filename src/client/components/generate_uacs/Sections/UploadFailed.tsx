import {ONSPanel} from "blaise-design-system-react-components";
import React, {ReactElement} from "react";

interface UploadFailedProps {
    instrumentName: String | undefined
}

function UploadFailed(props: UploadFailedProps): ReactElement {
    const {instrumentName} = props;

    return (
        <>
                            <ONSPanel status="error">
                                <p>
                                    <b>File upload failed</b>

                                    <br/>
                                    <br/>
                                    Sample file for instrument '{instrumentName}' has failed to deploy. When reporting the issue to
                                    Service
                                    Desk provide the questionnaire name, time and date of failure.
                                </p>
                            </ONSPanel>
        </>
    );
}

export default UploadFailed;