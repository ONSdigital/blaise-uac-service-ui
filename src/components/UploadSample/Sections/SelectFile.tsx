import { ONSPanel, StyledFormField } from "blaise-design-system-react-components";
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
        name: "Select a sample file",
        description: "File type accepted is .csv",
        type: "file",
        id: "sample-selector",
        validate: validateInput,
        className: "ons-input ons-input--text ons-input-type__input ons-input--upload",
        onChange: (e: ChangeEvent<HTMLInputElement>) => handleFileChange(e.target.files),
        accept: ".csv",
        disabled: isSubmitting,
        props: {},
        autoFocus: false,
    };

    return (
        <>
            <div className="ons-grid">
                <div className="ons-grid__col ons-col-8@m">
                    <h1>Upload a sample file</h1>
                    <ONSPanel>
                        <p>
                            The sample file must be a Comma-Separated Values (CSV) file containing the column <em
                                className="ons-highlight">serial_number</em>.
                        </p>
                        <p>
                            If the sample file already contains UACs, these may be overwritten if they were generated
                            outside of this process.
                        </p>
                        <p>
                            When a sample file is selected and you continue to upload this sample file, <b>this
                                may take a few minutes</b>.
                            <br />
                            <br />
                            Given this, <b>do not navigate away</b> from this page during this process. You will
                            be re-directed when there is an update regarding the upload of the sample.
                        </p>
                    </ONSPanel>
                    <StyledFormField {...field} />
                </div>
            </div>
        </>
    );
}

export default SelectFile;
