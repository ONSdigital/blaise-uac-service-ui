import {
  CsvValidationError,
  hasErrorMessage,
  isValidQuestionnaireName,
  isValidSampleFileName,
  isValidUac,
  readRequiredCsvField,
  toStringRecord,
} from "./validation.js";

describe("validation helpers", () => {
  it("validates questionnaire names", () => {
    expect(isValidQuestionnaireName("DST1234A_1")).toBe(true);
    expect(isValidQuestionnaireName("DST123")).toBe(false);
  });

  it("validates sample file names", () => {
    expect(isValidSampleFileName("DST1234A.csv")).toBe(true);
    expect(isValidSampleFileName("DST1234A.txt")).toBe(false);
  });

  it("validates UAC values", () => {
    expect(isValidUac("123456789012")).toBe(true);
    expect(isValidUac("12345ABC9012")).toBe(false);
  });

  it("detects structured error objects", () => {
    expect(hasErrorMessage({ error: "Nope" })).toBe(true);
    expect(hasErrorMessage({ error: 42 })).toBe(false);
  });

  it("constructs CsvValidationError instances with the expected name", () => {
    expect(new CsvValidationError("bad csv")).toHaveProperty("name", "CsvValidationError");
  });

  it("reads a required CSV field from a valid row", () => {
    expect(readRequiredCsvField({ serial_number: "100000001" }, "serial_number", "bad row")).toBe(
      "100000001",
    );
  });

  it("throws when the CSV row is not an object", () => {
    expect(() => readRequiredCsvField(null, "serial_number", "bad row")).toThrow(
      CsvValidationError,
    );
  });

  it("throws when the required CSV field is blank", () => {
    expect(() =>
      readRequiredCsvField({ serial_number: "   " }, "serial_number", "bad row"),
    ).toThrow("bad row");
  });

  it("converts a valid row to a string record", () => {
    expect(toStringRecord({ serial_number: "100000001", name: "Homer" })).toEqual({
      serial_number: "100000001",
      name: "Homer",
    });
  });

  it("throws when converting a null row to a string record", () => {
    expect(() => toStringRecord(null)).toThrow(CsvValidationError);
  });

  it("throws when converting a row with non-string values to a string record", () => {
    expect(() => toStringRecord({ serial_number: 1 })).toThrow(CsvValidationError);
  });
});
