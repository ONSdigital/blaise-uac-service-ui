import { ExternalLink, Panel } from "blaise-design-system-react-components";
import { type ReactElement } from "react";

interface Props {
  questionnaireName?: string;
  case_id?: string;
  responseStatus: string;
}

function Summary({ questionnaireName, case_id, responseStatus }: Props): ReactElement {
  const hasContext = questionnaireName || case_id;

  return (
    <>
      {responseStatus === "success" ? (
        <Panel
          status="success"
          bigIcon={true}
        >
          <h1>UAC has been enabled.</h1>
          {hasContext && (
            <p>
              Questionnaire: <em className="ons-highlight">{questionnaireName ?? "Unknown"}</em>.
              Case ID: <em className="ons-highlight">{case_id ?? "Unknown"}</em>.
            </p>
          )}
        </Panel>
      ) : (
        <Panel status="error">
          <h1>Failed to enable UAC.</h1>
          {hasContext && (
            <p>
              Questionnaire: <em className="ons-highlight">{questionnaireName ?? "Unknown"}</em>.
              Case ID: <em className="ons-highlight">{case_id ?? "Unknown"}</em>.
            </p>
          )}
          <p>
            Please report this issue to{" "}
            <ExternalLink
              text="Service Desk"
              link="https://ons.service-now.com/"
            />{" "}
            and include the questionnaire name, case ID, and the date and time of failure.
          </p>
        </Panel>
      )}
    </>
  );
}

export default Summary;
