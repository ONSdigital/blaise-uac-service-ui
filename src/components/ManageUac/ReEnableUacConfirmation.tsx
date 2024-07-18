import React, { ReactElement } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Breadcrumbs from "../breadcrumbs";
import { ONSButton, ONSLoadingPanel } from "blaise-design-system-react-components";
import axios from "axios";
import axiosConfig from "../../client/axiosConfig";

interface Location {
    questionnaireName: string;
    uac: string;
    case_id: string;
}

function ReEnableUacConfirmation(): ReactElement {
    const location = useLocation().state as Location;
    const { questionnaireName, uac, case_id } = location || { questionnaireName: "", uac: "", case_id: "" };

    const navigate = useNavigate();

    const [loading, isLoading] = React.useState(false);

    async function reEnableUacConfirmation() {
        isLoading(true);

        let res;
        try {
            res = await axios.get(`/api/v1/enableUac/${uac}`, axiosConfig());
        } catch (error) {
            console.error(JSON.stringify(error));
        }

        if (res?.data == "Success")
            res = "success";
        else
            res = "error";
        isLoading(false);
        navigate("/manageUac/enable", { state: { questionnaireName: questionnaireName, uac: uac, case_id: case_id, responseStatus: res } });
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

            <main id="main-content" className="ons-page__main ons-u-mt-no">
                {
                    (
                        <>
                            <h1 className="u-mb-l">
                                Are you sure, you want to Re-Enable<span><em className="highlight">{uac}</em> with case Id <em className="highlight">{case_id}</em> from Questionnaire <em className="highlight">{questionnaireName}</em></span> ?
                            </h1>
                            <br />
                            <ONSButton
                                label="Continue"
                                onClick={reEnableUacConfirmation}
                                primary
                                disabled={loading}
                            />
                            <ONSButton
                                label="Cancel"
                                onClick={() => navigate(-1)} primary={false} />
                        </>
                    )
                }
            </main>
        </>
    );
}

export default ReEnableUacConfirmation;