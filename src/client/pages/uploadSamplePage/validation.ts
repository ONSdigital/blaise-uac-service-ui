const QUESTIONNAIRE_NAME_REGEX = /^[A-Za-z]{3}\d{4}(?:[A-Za-z0-9_]+)?$/;

export function isValidQuestionnaireName(value: string | undefined): boolean {
  return typeof value === "string" && QUESTIONNAIRE_NAME_REGEX.test(value);
}
