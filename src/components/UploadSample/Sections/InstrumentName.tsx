import {ONSPanel, StyledFormErrorSummary, StyledFormField} from "blaise-design-system-react-components";
import React, {ChangeEvent, ReactElement} from "react";

interface SelectFilePageProps {
    instrumentName: string | undefined,
    setInstrumentName: any,
}

function InstrumentName(props: SelectFilePageProps): ReactElement {
    const {instrumentName, setInstrumentName} = props;

    function validateInstrumentName() {
        let error;
        if (!instrumentName) {
            error = "Enter a valid instrument name";
        } else if (
            instrumentName.length < 7
        ) {
            error = "Enter a valid instrument name (longer than 7 characters)";
        }
        return error;
    }

    const handleValueChange = (value: string | null) => {
        if (value && value.length > 1) {
            setInstrumentName(value);
        }
    };

    const field = {
        name: "questionnaire name",
        type: "input",
        id: "instrument-name",
        validate: validateInstrumentName,
        onChange: (e: ChangeEvent<HTMLInputElement>) => handleValueChange(e.target.value),
        className: "input input--text input-type__input",
    };

    return (
        <>
            <ONSPanel>
                <p>
                    Please enter the questionnaire name that you wish to generate UACs for
                </p>
            </ONSPanel>
            <StyledFormField {...field}/>
            <StyledFormErrorSummary/>
        </>
    );
}

export default InstrumentName;