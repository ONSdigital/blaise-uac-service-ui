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
                                Successfully enabled UAC {uac} with case Id {case_id} for questionnaire {questionnaireName}
                            </h1>
                        </ONSPanel>
                        :
                        <ONSPanel status="error">
                            <h1>
                                Enabling UAC {uac} with case Id {case_id} for questionnaire {questionnaireName} failed
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
