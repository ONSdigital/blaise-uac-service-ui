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
            <div className="grid">
                <div className="grid__col col-8@m">
                    <h1>Upload a sample file</h1>
                    <p>
                        The sample file must be a Comma-Separated Values (CSV) file containing the column <em
                        className="highlight">serial_number</em>.
                    </p>
                    <p>
                        Note if the sample file already contains any Unique Access Codes rows then these will be overwritten.
                    </p>
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
                    <StyledFormErrorSummary/>
                    <StyledFormField {...field}/>
                </div>
            </div>
        </>
    );
}

export default SelectFile;
