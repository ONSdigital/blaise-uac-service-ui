import csvUploadErrorMessage, {
  getMissingCsvColumn,
  isKnownCsvValidationIssue,
} from "./csvUploadErrorMessage";

import type { AxiosError } from "axios";

describe("csvUploadErrorMessage", () => {
  it("returns the structured API error message from an axios error", () => {
    const error = {
      isAxiosError: true,
      response: { data: { error: "Detailed failure" } },
    } as AxiosError;

    expect(csvUploadErrorMessage(error)).toBe("Detailed failure");
  });

  it("returns undefined when axios error data is not a structured error object", () => {
    const error = {
      isAxiosError: true,
      response: { data: { error: 123 } },
    } as AxiosError;

    expect(csvUploadErrorMessage(error)).toBeUndefined();
  });

  it("returns undefined for non-axios errors", () => {
    expect(csvUploadErrorMessage(new Error("nope"))).toBeUndefined();
  });

  it("detects known CSV validation issues", () => {
    expect(isKnownCsvValidationIssue("Column UAC is not in the CSV file")).toBe(true);
    expect(isKnownCsvValidationIssue("Unhandled backend error")).toBe(false);
    expect(isKnownCsvValidationIssue(undefined)).toBe(false);
  });

  it("extracts missing column from new-format CSV errors", () => {
    expect(getMissingCsvColumn("Column UAC is not in the CSV file")).toBe("UAC");
  });

  it("extracts missing column from legacy UAC-format CSV errors", () => {
    expect(getMissingCsvColumn('UAC column "Full_UAC" not in CSV')).toBe("Full_UAC");
  });

  it("extracts missing column from legacy missing-column CSV errors", () => {
    expect(getMissingCsvColumn("Missing column 'serial_number' in CSV file")).toBe("serial_number");
    expect(getMissingCsvColumn("Not a CSV column error")).toBeUndefined();
  });
});
