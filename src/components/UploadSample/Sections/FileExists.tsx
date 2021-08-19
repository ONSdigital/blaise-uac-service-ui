import {ONSPanel, StyledFormErrorSummary, StyledFormField} from "blaise-design-system-react-components";
import React, {ChangeEvent, ReactElement} from "react";

interface FileExistsPageProps {
    instrumentName: string | undefined,
    overwrite: string | undefined,
    setOverwrite: any,
}

function FileExists(props: FileExistsPageProps): ReactElement {
    const {instrumentName, overwrite, setOverwrite} = props;

    function validateOverwrite() {
        let error;
        if (!overwrite) {
            error = "Select an option";
        }
        return error;
    }

    const field = {
        name: "overwrite sample",
        description: "Overwrite sample file?",
        type: "radio",
        validate: validateOverwrite,
        onClick: (e: ChangeEvent<HTMLInputElement>) => setOverwrite(e.target.value),
        radioOptions: [
            {
                id: "Yes", label: "Yes", value: "Yes"
            },
            {
                id: "No", label: "No", value: "No"
            },
        ]
    };

    return (
        <>
            <ONSPanel>
                <p>
                    <b>UACs have already been generated this instrument on a previous sample upload</b>
                </p>
            </ONSPanel>
            <StyledFormField {...field}/>
            <StyledFormErrorSummary/>
        </>
    );
}

export default FileExists;