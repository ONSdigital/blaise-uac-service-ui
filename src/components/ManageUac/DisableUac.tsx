import React, { ReactElement, useState } from "react";
import { ONSButton, ONSPanel, ONSTextInput } from "blaise-design-system-react-components";
import axios from "axios";
import axiosConfig from "../../client/axiosConfig";

function DisableUac(): ReactElement {

    const [uac, setUac] = useState("");
    const [error, setError] = useState<string>("");
    const [submitDisable, setSubmitDisable] = useState(true);

    const [apiResponse, setApiResponse] = useState<string>("");

    async function disableUac() {
        let res;
        // let errorMessage;
        try {
            res = await axios.get(`/api/v1/disableUac/${uac}`, axiosConfig());
            console.log(JSON.stringify(res));
        } catch (error) {
            console.log(JSON.stringify(error));
        }
        if (res?.data == "Success")
            setApiResponse("Success");
        else
            setApiResponse("Error");
    }

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

                {apiResponse !== "" &&
                    (apiResponse === "Success" ?
                        <ONSPanel status="success" bigIcon={true}>
                            <h1>
                                Successfully Disabled the UAC {uac}
                            </h1>
                        </ONSPanel>
                        :
                        <ONSPanel status="error">
                            <h1>
                                Some error occured on disabling the UAC {uac}
                            </h1>
                            <p>
                                When reporting this issue to the Service Desk, please provide the questionnaire name, uac and the time of failure.
                            </p>
                        </ONSPanel>
                    )
                }

                {error && <span style={{ color: "red" }} className="error">{error}</span>}
                <ONSTextInput
                    autoFocus={true}
                    label="Enter UAC"
                    onClick={function noRefCheck() { }}
                    placeholder="Enter 12 char UAC"
                    value={uac}
                    onChange={handleChangeInUAC}
                />

                <ONSButton
                    label="Disable UAC"
                    disabled={submitDisable}
                    onClick={disableUac}
                    primary
                />

            </main >
        </>
    );
}

export default DisableUac;
