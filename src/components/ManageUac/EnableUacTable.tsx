import React, { ReactElement } from "react";
import { ONSTable } from "blaise-design-system-react-components";
import { Link, useLocation } from "react-router-dom";
import Breadcrumbs from "../breadcrumbs";

interface UacInfo {
    case_id: string,
    uac: string,
}

interface QuestionnaireWithDisabledUacs {
    questionnaireName: string;
    disabledUacs: UacInfo[];
}

interface State {
    questionnaireWithDisabledUacs: QuestionnaireWithDisabledUacs | null;
}

function EnableUacTable(): ReactElement {

    const location = useLocation().state as State;

    const { questionnaireWithDisabledUacs } = location || { questionnaireWithDisabledUacs: null };

    const questionnaireName = questionnaireWithDisabledUacs?.questionnaireName ?? "";

    const uacs = questionnaireWithDisabledUacs?.disabledUacs.map((obj) => (
        <tr
            className="ons-table__row"
            data-testid="questionnaire-table-row"
            key={obj.uac}
        >
            <td className="ons-table__cell">
                {obj.case_id}
            </td>
            <td className="ons-table__cell">
                {obj.uac}
            </td>
            <td className="ons-table__cell">
                <Link to="/reEnableUacConfirmation"
                    state={{ questionnaireName: questionnaireName, uac: obj.uac, case_id: obj.case_id }}
                    className="ons-breadcrumb__link"
                    aria-label={`ReEnableUAC ${obj.uac}`}>
                    Enable UAC
                </Link>
            </td>
        </tr >
    ));
    return (

        <>
            <main id="main-content" className="ons-page__main ons-u-mt-no">

                <Breadcrumbs BreadcrumbList={
                    [
                        { link: "/", title: "Home" }
                    ]
                } />

                <h2>Disabled UACs for <span><em className="highlight">{questionnaireName}</em></span></h2>
                {questionnaireName != "" && <ONSTable columns={["CaseID", "UAC", "Enable"]} tableID="uac-table">
                    <>{uacs}</>
                </ONSTable>
                }
            </main >
        </>

    );

}

export default EnableUacTable;
