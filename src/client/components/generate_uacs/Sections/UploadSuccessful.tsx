import {ONSPanel} from "blaise-design-system-react-components";
import React, {ReactElement} from "react";

interface UploadSuccessfulProps {
    instrumentName: String | undefined
}

function UploadFailed(props: UploadSuccessfulProps): ReactElement {
    const {instrumentName} = props;

    return (
        <>
                            <ONSPanel>
                                <p>
                                    <b>File upload succeeded</b>

                                    <br/>
                                    <br/>
                                    Sample file for instrument '{instrumentName}' has successfully uploaded
                                </p>
                            </ONSPanel>
        </>
    );
}

export default UploadFailed;