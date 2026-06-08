import type {
  QuestionnaireFile,
  QuestionnaireWithDisabledUacs,
} from "../types/questionnaire.types";
import type { Uacs } from "blaise-uac-service-node-client";

export const mockQuestionnaireNames: QuestionnaireFile[] = [
  { questionnaireName: "OPN2101A", lastModified: "2024-01-15T14:41:29.000Z" },
  { questionnaireName: "DST1345A", lastModified: "2024-03-10T09:00:00.000Z" },
  { questionnaireName: "DST5643A", lastModified: "2024-02-20T11:30:00.000Z" },
];

const mockDisabledUacsForQuestionnaire: Uacs = {
  "803920": {
    questionnaire_name: "LMS2209_EM1",
    case_id: "803920",
    uac_chunks: { uac1: "1002", uac2: "2293", uac3: "8976" },
    full_uac: "100222938976",
    disabled: true,
  },
  "804138": {
    questionnaire_name: "LMS2209_EM1",
    case_id: "804138",
    uac_chunks: { uac1: "1002", uac2: "6087", uac3: "6564" },
    full_uac: "100260876564",
    disabled: true,
  },
  "907195": {
    questionnaire_name: "LMS2209_EM1",
    case_id: "907195",
    uac_chunks: { uac1: "1004", uac2: "6119", uac3: "7282" },
    full_uac: "100461197282",
    disabled: true,
  },
};

export const mockQuestionnaireWithDisabledUacs: QuestionnaireWithDisabledUacs = {
  questionnaireName: "LMS2209_EM1",
  disabledUacs: Object.values(mockDisabledUacsForQuestionnaire).map(({ case_id, full_uac }) => ({
    case_id,
    uac: full_uac!,
  })),
};

export const mockQuestionnaireWithOneDisabledUac: QuestionnaireWithDisabledUacs = {
  questionnaireName: mockQuestionnaireWithDisabledUacs.questionnaireName,
  disabledUacs: [mockQuestionnaireWithDisabledUacs.disabledUacs[0]],
};
