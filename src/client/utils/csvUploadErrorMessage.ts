import { isAxiosError } from "axios";

function hasErrorMessage(value: unknown): value is { error: string } {
  return (
    typeof value === "object" &&
    value !== null &&
    "error" in value &&
    typeof (value as { error?: unknown }).error === "string"
  );
}

export default function csvUploadErrorMessage(error: unknown): string | undefined {
  if (!isAxiosError(error)) {
    return undefined;
  }

  const data = error.response?.data;

  return hasErrorMessage(data) ? data.error : undefined;
}

export function isKnownCsvValidationIssue(errorMessage: string | undefined): boolean {
  if (!errorMessage) {
    return false;
  }

  const normalised = errorMessage.toLowerCase();
  const knownCsvIndicators = [
    "csv",
    "column",
    "header",
    "serial_number",
    "full_uac",
    "case id",
    "row",
  ];

  return knownCsvIndicators.some((indicator) => normalised.includes(indicator));
}

export function getMissingCsvColumn(errorMessage: string | undefined): string | undefined {
  if (!errorMessage) {
    return undefined;
  }

  const newFormatMatch = errorMessage.match(/^Column\s+([^\s]+)\s+is not in the CSV file/i);

  if (newFormatMatch?.[1]) {
    return newFormatMatch[1];
  }

  const oldUacFormatMatch = errorMessage.match(/^UAC column\s+"([^"]+)"\s+not in CSV/i);

  if (oldUacFormatMatch?.[1]) {
    return oldUacFormatMatch[1];
  }

  const oldMissingFormatMatch = errorMessage.match(/^Missing column\s+'([^']+)'/i);

  return oldMissingFormatMatch?.[1];
}
