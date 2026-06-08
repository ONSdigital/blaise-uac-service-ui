import { Panel } from "blaise-design-system-react-components";
import { type ReactElement } from "react";
import { useLocation } from "react-router-dom";

import { parseDisableUacPageState } from "../../utils/uacRouteState";
import UacInvalidRouteState from "../shared/uacInvalidRouteState";

import Confirmation from "./sections/confirmation";
import Form from "./sections/form";

function DisableUac(): ReactElement {
  const parsedState = parseDisableUacPageState(useLocation().state);

  if (parsedState.status === "valid" && parsedState.value.kind === "confirmation") {
    return (
      <main
        id="main-content"
        className="ons-page__main ons-u-mt-no"
      >
        <div className="ons-grid">
          <div className="ons-grid__col ons-col-8@m">
            <Confirmation uac={parsedState.value.uac} />
          </div>
        </div>
      </main>
    );
  }

  const resultState =
    parsedState.status === "valid" && parsedState.value.kind === "result"
      ? parsedState.value.result
      : undefined;

  return (
    <main
      id="main-content"
      className="ons-page__main ons-u-mt-no"
    >
      <div className="ons-grid">
        <div className="ons-grid__col ons-col-8@m">
          {parsedState.status === "invalid" && (
            <UacInvalidRouteState message="The requested disable-UAC screen state was invalid. Start again below." />
          )}
          {!resultState && <h1 className="ons-u-mt-m">Which UAC do you want to disable?</h1>}
          {!resultState && (
            <Panel status="info">
              Disabling a UAC means the respondent can no longer use it to sign in to their
              questionnaire via the CAWI portal.
            </Panel>
          )}
          <Form resultState={resultState} />
        </div>
      </div>
    </main>
  );
}

export default DisableUac;
