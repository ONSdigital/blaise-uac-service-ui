import { useMutation } from "@tanstack/react-query";
import { Button } from "blaise-design-system-react-components";
import { type ReactElement, useState } from "react";

import { importUacsFromFile } from "../../fileFunctions";
import handleAuthRedirect from "../shared/handleAuthRedirect";

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
  const [file, setFile] = useState<File>();
  const [error, setError] = useState<Error | AxiosError>();
  const [uacsImported, setUacsImported] = useState<number>();
  const [activeStep, setActiveStep] = useState(Step.SelectFile);
  const [validationError, setValidationError] = useState<string>();
  const importUacsMutation = useMutation({
    mutationFn: (file: File) => importUacsFromFile(file),
    onSuccess: (count) => {
      setUacsImported(count);
      setActiveStep(Step.UploadSuccessful);
    },
    onError: (err) => {
      if (handleAuthRedirect(err)) {
        return;
      }

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

  async function handleSubmit(e: React.FormEvent) {
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
        await importUacsMutation.mutateAsync(file).catch(() => undefined);

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
          void handleSubmit(e);
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
