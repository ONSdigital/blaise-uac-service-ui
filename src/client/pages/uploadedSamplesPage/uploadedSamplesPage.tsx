import { useQuery } from "@tanstack/react-query";
import { Panel } from "blaise-design-system-react-components";
import { type ReactElement } from "react";

import { getListOfQuestionnairesWithExistingSampleFiles } from "../../fileFunctions";
import { QUESTIONNAIRE_NAMES_QUERY_KEY } from "../../queryKeys";

import UploadedSamples from "./sections/uploadedSamples";

import type { QuestionnaireFile } from "../../questionnaire.types";

function UploadedSamplesPage(): ReactElement {
  const {
    data: questionnaires = [],
    isLoading,
    isError,
  } = useQuery<QuestionnaireFile[]>({
    queryKey: QUESTIONNAIRE_NAMES_QUERY_KEY,
    queryFn: getListOfQuestionnairesWithExistingSampleFiles,
  });

  return (
    <main
      id="main-content"
      className="ons-page__main ons-u-mt-no"
    >
      <h1 className="ons-u-mt-m">Uploaded questionnaire samples with generated UACs</h1>
      <div className="ons-u-mt-m">
        {isLoading || questionnaires.length > 0 ? (
          <UploadedSamples
            uploadedSamples={questionnaires}
            loading={isLoading}
          />
        ) : (
          <Panel status={isError ? "error" : "info"}>
            {isError ? "Failed to load questionnaire samples." : "No questionnaire samples found."}
          </Panel>
        )}
      </div>
    </main>
  );
}

export default UploadedSamplesPage;
