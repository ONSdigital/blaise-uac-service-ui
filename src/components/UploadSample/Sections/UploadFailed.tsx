import {ONSPanel} from "blaise-design-system-react-components";
import React, {ReactElement} from "react";
import {AxiosError} from "axios";

interface UploadFailedProps {
    instrumentName: string | undefined;
    error: Error | AxiosError | undefined
}

function isAxiosError(error: any): error is AxiosError {
    return (error as AxiosError).isAxiosError !== undefined;
}

function UploadFailed(props: UploadFailedProps): ReactElement {
    const {instrumentName, error} = props;

    function errorDetailPanel(): ReactElement {
        console.error(error);
        if (isAxiosError(error)) {
            console.log(error.response);
            if (error?.response?.data?.error) {
                return <ONSPanel status="error">
                    <p>{error.response.data.error}</p>
                </ONSPanel>;
            }
        }
        return <></>;
    }

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
            {errorDetailPanel()}
        </>
    );
}

export default UploadFailed;