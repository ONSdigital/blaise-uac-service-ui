import { ONSPanel } from "blaise-design-system-react-components";
import React, { ReactElement } from "react";

interface UploadSuccessfulPageProps {
  uacsImported: number | undefined
}

function UploadSuccessful(props: UploadSuccessfulPageProps): ReactElement {
    let uacsImported = props.uacsImported;
    if (uacsImported == undefined) {
        uacsImported = 0;
    }

    return (
        <>
            <ONSPanel status="success">
                <p>UACs Imported: {uacsImported}</p>
            </ONSPanel>
        </>
    );
}

export default UploadSuccessful;
