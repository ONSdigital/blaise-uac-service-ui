import React, { ReactElement } from "react";
import Breadcrumbs from "../breadcrumbs";
import DisableUac from "./DisableUac";
import EnableUac from "./EnableUac";
import { useParams } from "react-router-dom";

function ManageUacPage(): ReactElement {

    const { action } = useParams();

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
                {action == "disable" && <DisableUac />}
                {action == "enable" && <EnableUac />}

            </main >
        </>
    );
}

export default ManageUacPage;
