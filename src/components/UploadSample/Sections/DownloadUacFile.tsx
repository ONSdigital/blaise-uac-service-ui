import {ONSPanel} from "blaise-design-system-react-components";
import React, {ReactElement} from "react";

interface DownloadUacPageProps {
    instrumentName: string | undefined
}

function DownloadUacFile(props: DownloadUacPageProps): ReactElement {
    const {instrumentName} = props;

    return (
        <>
            <ONSPanel>
                <p>
                    <b>Download UAC file for questionnaire {instrumentName} <a href="">here</a></b>
                </p>
            </ONSPanel>

        </>
    );
}

export default DownloadUacFile;