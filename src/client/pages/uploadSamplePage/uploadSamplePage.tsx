import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type AxiosError } from "axios";
import { Button } from "blaise-design-system-react-components";
import { Form, Formik, type FormikHelpers } from "formik";
import { type ReactElement, useState } from "react";
import { useNavigate } from "react-router-dom";

import { generateUacsForSampleFile, sampleFileAlreadyExists } from "../../api/fileFunctions";
import { AUDIT_LOGS_QUERY_KEY, QUESTIONNAIRE_NAMES_QUERY_KEY } from "../../query/queryKeys";
import handleAuthRedirect from "../../utils/handleAuthRedirect";

import ConfirmName from "./sections/confirmName";
import DownloadUacFile from "./sections/downloadUacFile";
import FileExists from "./sections/fileExists";
import QuestionnaireName from "./sections/questionnaireName";
import SelectFile from "./sections/selectFile";
import UploadFailed from "./sections/uploadFailed";

enum Step {
  QuestionnaireName,
  ConfirmName,
  AlreadyExists,
  SelectFile,
  DownloadFile,
  UploadFailed,
}

function UploadSample(): ReactElement {
  const [questionnaireName, setQuestionnaireName] = useState<string>("");
  const [file, setFile] = useState<File>();
  const [activeStep, setActiveStep] = useState<Step>(Step.QuestionnaireName);
  const [error, setError] = useState<Error | AxiosError>();

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const generateUacsMutation = useMutation({
    mutationFn: ({
      questionnaireName,
      file,
      overwrite,
    }: {
      questionnaireName: string | undefined;
      file: File | undefined;
      overwrite: boolean;
    }) => generateUacsForSampleFile(questionnaireName, file, overwrite),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUESTIONNAIRE_NAMES_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: AUDIT_LOGS_QUERY_KEY });
      setActiveStep(Step.DownloadFile);
    },
    onError: (error) => {
      if (handleAuthRedirect(error)) {
        return;
      }

      void queryClient.invalidateQueries({ queryKey: AUDIT_LOGS_QUERY_KEY });
      setError(error instanceof Error ? error : new Error(String(error)));
      setActiveStep(Step.UploadFailed);
    },
  });

  function renderStepContent(step: number) {
    switch (step) {
      case Step.QuestionnaireName:
        return (
          <QuestionnaireName
            questionnaireName={questionnaireName}
            setQuestionnaireName={setQuestionnaireName}
          />
        );
      case Step.ConfirmName:
        return <ConfirmName questionnaireName={questionnaireName} />;
      case Step.AlreadyExists:
        return <FileExists questionnaireName={questionnaireName} />;
      case Step.SelectFile:
        return (
          <SelectFile
            file={file}
            setFile={setFile}
          />
        );
      case Step.DownloadFile:
        return <DownloadUacFile questionnaireName={questionnaireName} />;
      case Step.UploadFailed:
        return (
          <UploadFailed
            questionnaireName={questionnaireName}
            error={error}
          />
        );
      default:
        return undefined;
    }
  }

  type FormValues = { override: string; confirm: string; "overwrite sample": string };

  async function handleSubmit(values: FormValues, { setFieldValue }: FormikHelpers<FormValues>) {
    switch (activeStep) {
      case Step.QuestionnaireName:
        setActiveStep(Step.ConfirmName);
        break;
      case Step.ConfirmName:
        if (values.confirm === "yes") {
          try {
            setActiveStep(
              (await sampleFileAlreadyExists(questionnaireName))
                ? Step.AlreadyExists
                : Step.SelectFile,
            );
          } catch (error) {
            if (handleAuthRedirect(error)) {
              return;
            }

            setError(error instanceof Error ? error : new Error(String(error)));
            setActiveStep(Step.UploadFailed);
          }

          break;
        }

        void setFieldValue("confirm", "");
        setActiveStep(Step.QuestionnaireName);
        break;
      case Step.AlreadyExists:
        if (values["overwrite sample"] === "Yes") {
          setActiveStep(Step.SelectFile);
        } else {
          void setFieldValue("overwrite sample", "");
          setActiveStep(Step.QuestionnaireName);
        }

        break;
      case Step.SelectFile:
        generateUacsMutation.mutate({
          questionnaireName,
          file,
          overwrite: values["overwrite sample"] === "Yes",
        });

        break;
      case Step.DownloadFile:
        navigate("/");
        break;
      default:
        setActiveStep(Step.QuestionnaireName);
    }
  }

  return (
    <main
      id="main-content"
      className="ons-page__main ons-u-mt-no"
    >
      <Formik
        validateOnBlur={false}
        validateOnChange={false}
        initialValues={{ override: "", confirm: "", "overwrite sample": "" }}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form id={"formID"}>
            <div>
              <div className="ons-u-mt-m">{renderStepContent(activeStep)}</div>
              <div className="ons-btn-group ons-u-mt-m">
                <Button
                  id={"next-screen-button"}
                  submit={true}
                  loading={isSubmitting || generateUacsMutation.isPending}
                  primary={true}
                  label={"Continue"}
                  onClick={(e) => e.currentTarget.blur()}
                />
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </main>
  );
}

export default UploadSample;
