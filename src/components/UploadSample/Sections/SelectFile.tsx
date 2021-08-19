import {ONSPanel, StyledFormErrorSummary, StyledFormField} from "blaise-design-system-react-components";
import React, {ChangeEvent, ReactElement} from "react";
import {FormikContextType, useFormikContext} from "formik";

interface SelectFilePageProps {
    file: File | undefined,
    setFile: any
}

function SelectFile(props: SelectFilePageProps): ReactElement {
    const {file, setFile} = props;
    const {isSubmitting}: FormikContextType<unknown> = useFormikContext();

    function validateInput() {
        let error;

        if (!file) {
            error = "Select a file";
        } else if (!file.name.endsWith(".csv")) {
            error = "File must be a .csv";
        }
        return error;
    }

    const handleFileChange = (selectorFiles: FileList | null) => {
        if (selectorFiles && selectorFiles.length === 1) {
            setFile(selectorFiles[0]);
        }
    };

    const field = {
        name: "Select a sample file",
        description: "File type accepted is .csv",
        type: "file",
        id: "sample-selector",
        validate: validateInput,
        className: "input input--text input-type__input input--upload",
        onChange: (e: ChangeEvent<HTMLInputElement>) => handleFileChange(e.target.files),
        accept: ".csv",
        disabled: isSubmitting
    };

    return (
        <>
            <ONSPanel>
                <p>
                    When a sample file is selected and you continue to upload this sample file, <b>this
                    may take a few minutes</b>.
                    <br/>
                    <br/>
                    Given this, <b>do not navigate away</b> from this page during this process. You will
                    be re-directed when there is an update regarding the deploy of the questionnaire.
                </p>
            </ONSPanel>

            <StyledFormField {...field}/>
            <StyledFormErrorSummary/>
        </>
    );
}

export default SelectFile;
