import React, { ReactElement } from "react";
import Breadcrumbs from "../breadcrumbs";
import DisableUac from "./DisableUac";
import QuestionnaireListWithDisabledUacs from "./QuestionnaireListWithDisabledUacs";
import { useLocation, useParams } from "react-router-dom";
import ReEnableUacSummary from "./ReEnableUacSummary";

interface State {
    questionnaireName: string;
    uac: string;
    case_id: string;
    responseStatus: string;
}

function ManageUacPage(): ReactElement {

    const { action } = useParams();
    const location = useLocation().state as State;
    const { questionnaireName, uac, case_id, responseStatus } = location || { questionnaireName: "", uac: 0, case_id: "" };

    let submitButtonLabel = "";
    if (action == "disable")
        submitButtonLabel = "Disable UAC";
    else
        submitButtonLabel = "Enable UAC";

    return (
        <>
            <main id="main-content" className="ons-page__main ons-u-mt-no">

                <Breadcrumbs BreadcrumbList={
                    [
                        { link: "/", title: "Home" }, { link: `/manageUac/${action}`, title: submitButtonLabel }
                    ]
                } />
                {questionnaireName && uac && case_id && responseStatus && < ReEnableUacSummary questionnaireName={questionnaireName} uac={uac} case_id={case_id} responseStatus={responseStatus} />}

                {action == "disable" && <DisableUac />}
                {action == "enable" && <QuestionnaireListWithDisabledUacs />}

            </main >
        </>
    );
}

export default ManageUacPage;
