import React, { ReactElement } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Breadcrumbs from "../breadcrumbs";
import { ONSButton, ONSLoadingPanel } from "blaise-design-system-react-components";
import axios from "axios";
import axiosConfig from "../../client/axiosConfig";

function DisableUacConfirmation(): ReactElement {
    const { uac } = useParams();
    const navigate = useNavigate();
    const [loading, isLoading] = React.useState(false);

    async function callDisableUacFunction() {
        isLoading(true);
        let res;
        try {
            res = await axios.get(`/api/v1/disableUac/${uac}`, axiosConfig());
        } catch (error) {
            console.log(JSON.stringify(error));
        }
        if (res?.data == "Success")
            navigate("/manageUac/disable", { state: { disabledUac: uac, responseCode: 200 } });
        else
            navigate("/manageUac/disable", { state: { disabledUac: uac, responseCode: 500 } });

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

            <>
                <h1 className="u-mb-l">
                    Are you sure you want to disable UAC <span><em className="highlight">{uac}</em></span>?
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
        </>
    );
}

export default DisableUacConfirmation;