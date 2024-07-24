export interface UacInfo {
    case_id: string,
    uac: string,
}

export interface QuestionnaireWithDisabledUacs {
    questionnaireName: string;
    disabledUacs: UacInfo[];
}