import {ONSPanel} from "blaise-design-system-react-components";
import React, {ReactElement} from "react";

interface UploadSuccessfulProps {
    instrumentName: string | undefined
}

function FileExists(props: UploadSuccessfulProps): ReactElement {
    const {instrumentName} = props;

    return (
        <>
            <ONSPanel>
                <p>
                    <b>File already exists</b>

                    <br/>
                    <br/>
                    Sample file for instrument &apos;{instrumentName}&apos; already exists
                </p>
            </ONSPanel>
        </>
    );
}

export default FileExists;