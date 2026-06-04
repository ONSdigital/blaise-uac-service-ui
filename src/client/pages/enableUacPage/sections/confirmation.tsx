import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, LoadingPanel } from "blaise-design-system-react-components";
import { type ReactElement } from "react";
import { useNavigate } from "react-router-dom";

import { enableUac } from "../../../fileFunctions";
import { AUDIT_LOGS_QUERY_KEY, DISABLED_UACS_QUERY_KEY } from "../../../queryKeys";
import handleAuthRedirect from "../../shared/handleAuthRedirect";

interface Props {
  questionnaireName: string;
  uac: string;
  case_id: string;
}

function Confirmation({ questionnaireName, uac, case_id }: Props): ReactElement {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const enableUacMutation = useMutation({
    mutationFn: () => enableUac(uac),
    onSuccess: (success) => {
      void queryClient.invalidateQueries({ queryKey: AUDIT_LOGS_QUERY_KEY });

      if (success) {
        void queryClient.invalidateQueries({ queryKey: DISABLED_UACS_QUERY_KEY });
      }

      navigate("/enable-uac", {
        state: {
          questionnaireName,
          uac,
          case_id,
          responseStatus: success ? "success" : "error",
        },
      });
    },
    onError: (error) => {
      if (handleAuthRedirect(error)) {
        return;
      }

      void queryClient.invalidateQueries({ queryKey: AUDIT_LOGS_QUERY_KEY });
      navigate("/enable-uac", {
        state: { questionnaireName, uac, case_id, responseStatus: "error" },
      });
    },
  });

  if (enableUacMutation.isPending) {
    return <LoadingPanel />;
  }

  return (
    <>
      <h1 className="ons-u-mt-m ons-u-mb-l">
        Are you sure you want to enable UAC <em className="ons-highlight">{uac}</em> for case{" "}
        <em className="ons-highlight">{case_id}</em> in questionnaire{" "}
        <em className="ons-highlight">{questionnaireName}</em>?
      </h1>
      <Button
        label="Continue"
        onClick={() => enableUacMutation.mutate()}
        primary
        disabled={enableUacMutation.isPending}
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
