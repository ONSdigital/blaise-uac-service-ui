import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, LoadingPanel } from "blaise-design-system-react-components";
import { type ReactElement } from "react";
import { useNavigate } from "react-router-dom";

import { disableUac } from "../../../fileFunctions";
import { AUDIT_LOGS_QUERY_KEY, DISABLED_UACS_QUERY_KEY } from "../../../queryKeys";
import handleAuthRedirect from "../../shared/handleAuthRedirect";

interface Props {
  uac: string;
}

function Confirmation({ uac }: Props): ReactElement {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const disableUacMutation = useMutation({
    mutationFn: () => disableUac(uac),
    onSuccess: (success) => {
      void queryClient.invalidateQueries({ queryKey: AUDIT_LOGS_QUERY_KEY });

      if (success) {
        void queryClient.invalidateQueries({ queryKey: DISABLED_UACS_QUERY_KEY });
        navigate("/disable-uac", { state: { disabledUac: uac, responseCode: 200 } });

        return;
      }

      navigate("/disable-uac", { state: { disabledUac: uac, responseCode: 500 } });
    },
    onError: (error) => {
      if (handleAuthRedirect(error)) {
        return;
      }

      void queryClient.invalidateQueries({ queryKey: AUDIT_LOGS_QUERY_KEY });
      navigate("/disable-uac", { state: { disabledUac: uac, responseCode: 500 } });
    },
  });

  if (disableUacMutation.isPending) {
    return <LoadingPanel />;
  }

  return (
    <>
      <h1 className="ons-u-mt-m ons-u-mb-l">
        Are you sure you want to disable UAC{" "}
        <span>
          <em className="ons-highlight">{uac}</em>
        </span>
        ?
      </h1>
      <Button
        label="Continue"
        primary
        disabled={disableUacMutation.isPending}
        onClick={() => disableUacMutation.mutate()}
      />
      <Button
        label="Cancel"
        onClick={() => navigate(-1)}
        primary={false}
      />
    </>
  );
}

export default Confirmation;
