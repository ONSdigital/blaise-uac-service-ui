export interface QuestionnaireSummary {
  name: string;
}

export class CsvValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CsvValidationError";
  }
}

const QUESTIONNAIRE_NAME_REGEX = /^[A-Za-z]{3}\d{4}(?:[A-Za-z0-9_]+)?$/;
const SAMPLE_FILE_NAME_REGEX = /^[A-Za-z]{3}\d{4}(?:[A-Za-z0-9_]+)?\.csv$/i;
const UAC_REGEX = /^\d{12}$/;

export function isValidQuestionnaireName(value: string): boolean {
  return QUESTIONNAIRE_NAME_REGEX.test(value);
}

export function isValidSampleFileName(value: string): boolean {
  return SAMPLE_FILE_NAME_REGEX.test(value);
}

export function isValidUac(value: string): boolean {
  return UAC_REGEX.test(value);
}

export function hasErrorMessage(value: unknown): value is { error: string } {
  return (
    typeof value === "object" &&
    value !== null &&
    "error" in value &&
    typeof (value as { error?: unknown }).error === "string"
  );
}

export function readRequiredCsvField(
  row: unknown,
  fieldName: string,
  errorMessage: string,
): string {
  if (typeof row !== "object" || row === null) {
    throw new CsvValidationError(errorMessage);
  }

  const value = (row as Record<string, unknown>)[fieldName];

  if (typeof value !== "string" || value.trim() === "") {
    throw new CsvValidationError(errorMessage);
  }

  return value;
}

export function toStringRecord(
  row: unknown,
  errorMessage = "There is a problem with the CSV file",
): Record<string, string> {
  if (typeof row !== "object" || row === null) {
    throw new CsvValidationError(errorMessage);
  }

  const record: Record<string, string> = {};

  for (const [key, value] of Object.entries(row)) {
    if (typeof value !== "string") {
      throw new CsvValidationError(errorMessage);
    }

    record[key] = value;
  }

  return record;
}
