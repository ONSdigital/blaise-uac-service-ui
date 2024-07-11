import React, { ReactElement } from "react";
import { ONSPanel } from "blaise-design-system-react-components";

interface Props {
    questionnaireName: string;
    uac: string;
    case_id: string;
    responseStatus: string;
}

function ReEnableUacSummary({ questionnaireName, uac, case_id, responseStatus }: Props): ReactElement {

    return (
        <>
            <main id="main-content" className="ons-page__main ons-u-mt-no">
                {
                    (responseStatus === "success" ?
                        <ONSPanel status="success" bigIcon={true}>
                            <h1>
                                Successfully Re-Enabled uac {uac} with Case Id {case_id} for Questionnaire {questionnaireName}
                            </h1>
                        </ONSPanel>
                        :
                        <ONSPanel status="error">
                            <h1>
                                Re-Enabling uac {uac} with Case Id {case_id} for Questionnaire {questionnaireName} failed
                            </h1>
                            <p>
                                When reporting this issue to the Service Desk, please provide the questionnaire name, uac and case Id with time and date of the failure.
                            </p>
                        </ONSPanel>
                    )
                }
            </main>
        </>
    );
}

export default ReEnableUacSummary;
