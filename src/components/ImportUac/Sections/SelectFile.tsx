import {ONSPanel, StyledFormErrorSummary, StyledFormField} from "blaise-design-system-react-components";
import React, {ChangeEvent, ReactElement} from "react";
import {FormikContextType, useFormikContext} from "formik";

interface SelectFilePageProps {
    file: File | undefined,
    setFile: (file: File) => void
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
        name: "Select a uac file",
        description: "File type accepted is .csv",
        type: "file",
        id: "uac-selector",
        validate: validateInput,
        className: "input input--text input-type__input input--upload",
        onChange: (e: ChangeEvent<HTMLInputElement>) => handleFileChange(e.target.files),
        accept: ".csv",
        disabled: isSubmitting,
        props: {}
    };

    return (
        <>
            <div className="grid">
                <div className="grid__col col-8@m">
                    <h1>Import UACs from file</h1>
                    <ONSPanel>
                        <p>
                            The UAC file must be a Comma-Separated Values (CSV) file containing the column <em
                            className="highlight">Full_UAC</em>.
                        </p>
                    </ONSPanel>
                    <StyledFormErrorSummary/>
                    <StyledFormField {...field}/>
                </div>
            </div>
        </>
    );
}

export default SelectFile;
