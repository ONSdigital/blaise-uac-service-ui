import { StyledFormErrorSummary, StyledFormField} from "blaise-design-system-react-components";
import React, {ChangeEvent, ReactElement} from "react";
import {FormikContextType, useFormikContext} from "formik";

interface SelectFilePageProps {
    file: File | undefined,
    setFile: any,
    loading: boolean
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
        name: "Select sample file",
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
            <StyledFormErrorSummary/>

            <StyledFormField {...field}/>
        </>
    );
}

export default SelectFile;
