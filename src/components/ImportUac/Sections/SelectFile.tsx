import { ONSPanel, StyledFormErrorSummary, StyledFormField } from "blaise-design-system-react-components";
import React, { ChangeEvent, ReactElement } from "react";
import { FormikContextType, useFormikContext } from "formik";

interface SelectFilePageProps {
    file: File | undefined,
    setFile: (file: File) => void
}

function SelectFile(props: SelectFilePageProps): ReactElement {
    const { file, setFile } = props;
    const { isSubmitting }: FormikContextType<unknown> = useFormikContext();

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
        className: "ons-input ons-input--text ons-input-type__input ons-input--upload",
        onChange: (e: ChangeEvent<HTMLInputElement>) => handleFileChange(e.target.files),
        accept: ".csv",
        disabled: isSubmitting,
        props: {},
        autoFocus: false
    };

    return (
        <>
            <div className="ons-grid">
                <div className="ons-grid__col ons-col-8@m">
                    <h1>Import UACs from file</h1>
                    <ONSPanel>
                        <p>
                            The UAC file must be a Comma-Separated Values (CSV) file containing the column <em
                                className="ons-highlight">Full_UAC</em>.
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
