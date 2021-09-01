import {ONSPanel, StyledFormErrorSummary, StyledFormField} from "blaise-design-system-react-components";
import React, {ChangeEvent, ReactElement} from "react";

interface SelectFilePageProps {
    instrumentName: string | undefined,
    setInstrumentName: (string: string) => void,
}

function InstrumentName(props: SelectFilePageProps): ReactElement {
    const {instrumentName, setInstrumentName} = props;

    function validateInstrumentName() {
        const regExpr = new RegExp("^[a-zA-Z]{3}\\d{4}");

        if (!instrumentName || instrumentName.match(regExpr) == null) {
            return "Enter a questionnaire name in the correct format. Example, OPN2101A.";
        }
    }

    const field = {
        name: "questionnaire name",
        type: "input",
        id: "questionnaire name",
        validate: validateInstrumentName,
        value: instrumentName,
        onChange: (e: ChangeEvent<HTMLInputElement>) => setInstrumentName(e.target.value),
        className: "input input--text input-type__input",
        autoFocus: true
    };

    return (
        <>
            <div className="grid">
                <div className="grid__col col-8@m">
                    <h1>Which questionnaire do you wish to generate UACs for?</h1>
                    <StyledFormErrorSummary/>
                    <ONSPanel>
                        <p>The start of the questionnaire name must be three letters followed by four numbers. Example, OPN2101A.</p>
                    </ONSPanel>
                    <StyledFormField {...field}/>
                </div>
            </div>
        </>
    );
}

export default InstrumentName;