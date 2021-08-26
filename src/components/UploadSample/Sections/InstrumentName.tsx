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
            return "Enter a questionnaire name in the correct format, such as DST2004";
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
                    <h1>Which questionnaire do you wish to generate Unique Access Codes for?</h1>
                    <StyledFormErrorSummary/>
                    <ONSPanel>
                        <p>Questionnaire name should in the formatted as three letters followed by four numbers, such
                            as DST2004</p>
                    </ONSPanel>
                    <StyledFormField {...field}/>
                </div>
            </div>
        </>
    );
}

export default InstrumentName;