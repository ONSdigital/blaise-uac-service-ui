import { Button, Panel, TextInput } from "blaise-design-system-react-components";
import { type ReactElement, useState } from "react";
import { useNavigate } from "react-router-dom";

function Form(): ReactElement {
  const [uac, setUac] = useState("");
  const [error, setError] = useState<string>("");
  const [submitDisabled, setSubmitDisabled] = useState(true);

  const navigate = useNavigate();

  const handleChangeInUac = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uacValue = event.target.value;

    setUac(uacValue);

    if (/\D/.test(uacValue)) {
      setError("UAC must contain digits only");
      setSubmitDisabled(true);
    } else if (uacValue.length !== 12) {
      setError("UAC must be exactly 12 digits");
      setSubmitDisabled(true);
    } else {
      setError("");
      setSubmitDisabled(false);
    }
  };

  return (
    <>
      {error && <Panel status="error">{error}</Panel>}
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
          label="Enable UAC"
          disabled={submitDisabled}
          onClick={() => navigate("/enable-uac", { state: { step: "confirmation", uac } })}
          primary
        />
      </div>
    </>
  );
}

export default Form;
