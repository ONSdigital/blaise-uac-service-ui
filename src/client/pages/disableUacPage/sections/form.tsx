import { Button, ExternalLink, Panel, TextInput } from "blaise-design-system-react-components";
import { type ReactElement, useState } from "react";
import { useNavigate } from "react-router-dom";

import type { DisableUacResultState } from "../../shared/uacRouteState";

interface Props {
  resultState?: DisableUacResultState;
}

function Form({ resultState }: Props): ReactElement {
  const [uac, setUac] = useState("");
  const [error, setError] = useState<string>("");
  const [submitDisable, setSubmitDisable] = useState(true);

  const navigate = useNavigate();

  const handleChangeInUac = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uacVal = event.target.value;

    setUac(uacVal);

    if (/\D/.test(uacVal)) {
      setError("UAC must contain digits only");
      setSubmitDisable(true);
    } else if (uacVal.length !== 12) {
      setError("UAC must be exactly 12 digits");
      setSubmitDisable(true);
    } else {
      setError("");
      setSubmitDisable(false);
    }
  };

  return (
    <>
      {resultState?.responseCode === 200 && (
        <Panel
          status="success"
          bigIcon={true}
        >
          <h1>UAC {resultState.disabledUac} has been disabled</h1>
        </Panel>
      )}
      {resultState?.responseCode === 500 && (
        <Panel status="error">
          <h1>Failed to disable UAC {resultState.disabledUac}</h1>
          <p>
            Please report this issue to{" "}
            <ExternalLink
              text="Service Desk"
              link="https://ons.service-now.com/"
            />{" "}
            and include the UAC and the date and time of failure.
          </p>
        </Panel>
      )}
      {error && <Panel status={"error"}>{error}</Panel>}
      <div className="ons-u-mt-m">
        <TextInput
          autoFocus={true}
          label="UAC"
          onClick={function noRefCheck() {}}
          placeholder="Enter 12-digit UAC"
          value={uac}
          onChange={handleChangeInUac}
        />
      </div>
      <div className="ons-btn-group ons-u-mt-m">
        <Button
          label="Disable UAC"
          disabled={submitDisable}
          onClick={() => navigate("/disable-uac", { state: { step: "confirmation", uac } })}
          primary
        />
      </div>
    </>
  );
}

export default Form;
