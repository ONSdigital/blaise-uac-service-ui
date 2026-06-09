import { ExternalLink, Panel } from "blaise-design-system-react-components";
import { type ReactElement } from "react";

interface Props {
  questionnaireName: string;
  uac: string;
  case_id: string;
  responseStatus: string;
}

function Summary({ questionnaireName, uac, case_id, responseStatus }: Props): ReactElement {
  return (
    <>
      {responseStatus === "success" ? (
        <Panel
          status="success"
          bigIcon={true}
        >
          <h1>
            UAC {uac} has been enabled for case {case_id} in {questionnaireName}
          </h1>
        </Panel>
      ) : (
        <Panel status="error">
          <h1>
            Failed to enable UAC {uac} for case {case_id} in {questionnaireName}
          </h1>
          <p>
            Please report this issue to{" "}
            <ExternalLink
              text="Service Desk"
              link="https://ons.service-now.com/"
            />{" "}
            and include the questionnaire name, UAC, case ID, and the date and time of failure.
          </p>
        </Panel>
      )}
    </>
  );
}

export default Summary;
