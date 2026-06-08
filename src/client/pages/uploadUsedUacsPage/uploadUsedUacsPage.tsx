import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "blaise-design-system-react-components";
import { type ReactElement, useState } from "react";

import { importUacsFromFile } from "../../api/fileFunctions";
import { AUDIT_LOGS_QUERY_KEY } from "../../query/queryKeys";
import handleAuthRedirect from "../../utils/handleAuthRedirect";

import SelectFile from "./sections/selectFile";
import UploadFailed from "./sections/uploadFailed";
import UploadSuccessful from "./sections/uploadSuccessful";

import type { AxiosError } from "axios";

enum Step {
  SelectFile,
  UploadFailed,
  UploadSuccessful,
}

function UploadUsedUacs(): ReactElement {
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File>();
  const [error, setError] = useState<Error | AxiosError>();
  const [uacsImported, setUacsImported] = useState<number>();
  const [activeStep, setActiveStep] = useState(Step.SelectFile);
  const [validationError, setValidationError] = useState<string>();
  const importUacsMutation = useMutation({
    mutationFn: (file: File) => importUacsFromFile(file),
    onSuccess: (count) => {
      void queryClient.invalidateQueries({ queryKey: AUDIT_LOGS_QUERY_KEY });
      setUacsImported(count);
      setActiveStep(Step.UploadSuccessful);
    },
    onError: (err) => {
      if (handleAuthRedirect(err)) {
        return;
      }

      void queryClient.invalidateQueries({ queryKey: AUDIT_LOGS_QUERY_KEY });
      setError(err instanceof Error ? err : new Error(String(err)));
      setActiveStep(Step.UploadFailed);
    },
  });

  function renderStepContent(step: number) {
    switch (step) {
      case Step.SelectFile:
        return (
          <SelectFile
            file={file}
            setFile={setFile}
            isSubmitting={importUacsMutation.isPending}
            validationError={validationError}
          />
        );
      case Step.UploadFailed:
        return <UploadFailed error={error} />;
      case Step.UploadSuccessful:
        return <UploadSuccessful uacsImported={uacsImported} />;
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    switch (activeStep) {
      case Step.SelectFile: {
        if (!file) {
          setValidationError("Select a file");

          return;
        }

        if (!file.name.endsWith(".csv")) {
          setValidationError("File must be a .csv");

          return;
        }

        setValidationError(undefined);
        importUacsMutation.mutate(file);

        break;
      }

      default:
        setActiveStep(Step.SelectFile);
    }
  }

  return (
    <main
      id="main-content"
      className="ons-page__main ons-u-mt-no"
    >
      <form
        id={"formID"}
        onSubmit={(e) => {
          handleSubmit(e);
        }}
      >
        <div>
          <div className="ons-u-mt-m">{renderStepContent(activeStep)}</div>
          <div className="ons-btn-group ons-u-mt-m">
            <Button
              id={"next-screen-button"}
              submit={true}
              loading={importUacsMutation.isPending}
              primary={true}
              label={"Continue"}
              onClick={(e) => e.currentTarget.blur()}
            />
          </div>
        </div>
      </form>
    </main>
  );
}

export default UploadUsedUacs;
