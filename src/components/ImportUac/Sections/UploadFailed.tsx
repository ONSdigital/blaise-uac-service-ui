import { AxiosError } from "axios";
import { ONSPanel } from "blaise-design-system-react-components";
import React, { ReactElement } from "react";

interface UploadFailedPageProps {
    error: Error | AxiosError | undefined
}

function isAxiosError(error: any): error is AxiosError {
    return (error as AxiosError).isAxiosError !== undefined;
}

function UploadFailed(props: UploadFailedPageProps): ReactElement {
    const { error } = props;
    let errorDetailPanel: any;

    console.error(error);
    if (isAxiosError(error)) {
        console.log(error.response);
        if (error?.response?.data?.error) {
            errorDetailPanel = <ONSPanel status="error">
                <p>{error.response.data.error}</p>
            </ONSPanel>;
        }
    }

    return (
        <>
            <ONSPanel status="error">
                <h1>File upload failed</h1>
                <p>
                    UAC file has failed to upload.
                </p>
                <p>
                    When reporting this issue to the Service Desk, please provide the time and
                    date of the failure.
                </p>
            </ONSPanel>
            {errorDetailPanel}
        </>
    );
}

export default UploadFailed;
