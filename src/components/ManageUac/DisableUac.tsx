import React, { ReactElement, useState } from "react";
import { ONSButton, ONSPanel, ONSTextInput } from "blaise-design-system-react-components";
import { useNavigate } from "react-router-dom";

function DisableUac(): ReactElement {

    const [uac, setUac] = useState("");
    const [error, setError] = useState<string>("");
    const [submitDisable, setSubmitDisable] = useState(true);

    const navigate = useNavigate();

    const handleChangeInUAC = (event: React.ChangeEvent<HTMLInputElement>) => {
        const uacVal = event.target.value;

        if (uacVal.length < 12 || uacVal.length > 12) {
            setError("The UAC input needs to be 12 digits long");
            setSubmitDisable(true);
        }
        else {
            setUac(uacVal);
            setError("");
            setSubmitDisable(false);
        }

        if ((/\D/.test(uacVal))) {
            setUac(uacVal);
            setError("The UAC input can only contain digits");
            setSubmitDisable(true);
        }
        else {
            setUac(uacVal);
        }

    };

    return (
        <>
            <main id="main-content" className="ons-page__main ons-u-mt-no">

                {error && <ONSPanel spacious={true} status={"error"}>{error}</ONSPanel>}
                <ONSTextInput
                    autoFocus={true}
                    label="Enter UAC"
                    onClick={function noRefCheck() { }}
                    placeholder="Enter 12 digit UAC"
                    value={uac}
                    onChange={handleChangeInUAC}
                />
                <br />
                <ONSButton
                    label="Disable UAC"
                    disabled={submitDisable}
                    onClick={() => navigate(`/disableUacConfirmation/${uac}`)}
                    primary
                />

            </main >
        </>
    );
}

export default DisableUac;
