import { type ReactElement } from "react";
import { useLocation } from "react-router-dom";

import { parseEnableUacPageState } from "../../utils/uacRouteState";
import UacInvalidRouteState from "../shared/uacInvalidRouteState";

import Confirmation from "./sections/confirmation";
import QuestionnairesWithDisabledUacs from "./sections/questionnairesWithDisabledUacs";
import Summary from "./sections/summary";
import TableSection from "./sections/table";

function EnableUac(): ReactElement {
  const parsedState = parseEnableUacPageState(useLocation().state);

  if (parsedState.status === "valid" && parsedState.value.kind === "table") {
    return (
      <main
        id="main-content"
        className="ons-page__main ons-u-mt-no"
      >
        <TableSection
          questionnaireWithDisabledUacs={parsedState.value.questionnaireWithDisabledUacs}
        />
      </main>
    );
  }

  if (parsedState.status === "valid" && parsedState.value.kind === "confirmation") {
    return (
      <main
        id="main-content"
        className="ons-page__main ons-u-mt-no"
      >
        <div className="ons-grid">
          <div className="ons-grid__col ons-col-8@m">
            <Confirmation
              questionnaireName={parsedState.value.questionnaireName}
              uac={parsedState.value.uac}
              case_id={parsedState.value.case_id}
            />
          </div>
        </div>
      </main>
    );
  }

  const summaryState =
    parsedState.status === "valid" && parsedState.value.kind === "summary"
      ? parsedState.value
      : undefined;

  return (
    <main
      id="main-content"
      className="ons-page__main ons-u-mt-no"
    >
      <div className="ons-grid">
        <div className="ons-grid__col ons-col-8@m">
          {parsedState.status === "invalid" && (
            <UacInvalidRouteState message="The requested enable-UAC screen state was invalid. Start again from the list below." />
          )}
          {!summaryState && <h1 className="ons-u-mt-m">Which UAC do you want to enable?</h1>}
          {summaryState && (
            <Summary
              questionnaireName={summaryState.questionnaireName}
              uac={summaryState.uac}
              case_id={summaryState.case_id}
              responseStatus={summaryState.responseStatus}
            />
          )}
        </div>
      </div>
      <QuestionnairesWithDisabledUacs />
    </main>
  );
}

export default EnableUac;
