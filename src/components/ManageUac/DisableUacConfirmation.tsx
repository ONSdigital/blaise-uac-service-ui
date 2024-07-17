import React, { ReactElement, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Breadcrumbs from "../breadcrumbs";
import { ONSButton, ONSLoadingPanel, ONSPanel } from "blaise-design-system-react-components";
import axios from "axios";
import axiosConfig from "../../client/axiosConfig";

function DisableUacConfirmation(): ReactElement {
    const { uac } = useParams();
    const navigate = useNavigate();
    const [loading, isLoading] = React.useState(false);
    const [showButton, setShowButton] = useState<boolean>(true);
    const [apiResponse, setApiResponse] = useState<string>("");

    async function callDisableUacFunction() {
        isLoading(true);
        setShowButton(false);
        let res;
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
        isLoading(false);
    }

    if (loading) {
        return <ONSLoadingPanel />;
    }
    return (
        <>
            <Breadcrumbs BreadcrumbList={
                [
                    { link: "/", title: "Home" }
                ]
            } />

            {showButton &&
                (
                    <>
                        <h1 className="u-mb-l">
                            Are you sure, you want to Disable <span><em className="highlight">{uac}</em></span>?
                        </h1>
                        <br />
                        <ONSButton
                            label="Continue"
                            primary
                            disabled={loading}
                            onClick={callDisableUacFunction}
                        />
                        <ONSButton
                            label="Cancel"
                            onClick={() => navigate(-1)} primary={false}
                        />

                    </>
                )
            }

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
                    )}
            </main>
        </>
    );
}

export default DisableUacConfirmation;