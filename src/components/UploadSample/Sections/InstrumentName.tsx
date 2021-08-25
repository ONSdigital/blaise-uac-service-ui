import {ONSPanel, StyledFormErrorSummary, StyledFormField} from "blaise-design-system-react-components";
import React, {ChangeEvent, ReactElement} from "react";

interface SelectFilePageProps {
    instrumentName: string | undefined,
    setInstrumentName: any,
}

function InstrumentName(props: SelectFilePageProps): ReactElement {
    const {instrumentName, setInstrumentName} = props;

    function validateInstrumentName() {
        const regExpr = new RegExp("^[a-zA-Z]{3}\\d{4}");

        if (!instrumentName || instrumentName.match(regExpr) == null) {
            return "Enter a valid instrument name (three letters followed by four numbers)";
        }
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