import { EventEmitter } from "node:events";

import {
  mockDuplicateColumnSampleCsv,
  mockEmptyQuestionnaireUacDetails,
  mockInvalidSampleCsv,
  mockMatchedQuestionnaireUac16Details,
  mockMatchedQuestionnaireUacDetails,
  mockPartialMatchedQuestionnaireUacDetails,
  mockUnMatchedQuestionnaireUacDetails,
  mockValidSampleCsv,
  mockValidSampleCsvWithDuplicateSerialNumbers,
  mockValidSampleCsvWithExistingLowercaseUacColumns,
  mockValidSampleCsvWithExistingMixedCaseUacColumns,
  mockValidSampleCsvWithExistingUacColumns,
  mockValidSampleCsvWithExistingUacEntries,
  mockValidUacImportCsv,
} from "../../server/test-utils/csv.mock.js";

import { addUacsToFile, getCaseIdsFromFile, getUacsFromFile } from "./csvParser.js";

import type * as ValidationModule from "../validation.js";

function createMockParser(
  events: Array<[string, unknown]>,
): EventEmitter & { destroy: ReturnType<typeof vi.fn> } {
  const parser = new EventEmitter() as EventEmitter & { destroy: ReturnType<typeof vi.fn> };

  parser.destroy = vi.fn();

  queueMicrotask(() => {
    events.forEach(([event, payload]) => {
      parser.emit(event, payload);
    });
  });

  return parser;
}

describe("getUacsFromFile tests", () => {
  it("Valid CSV - returns a list of UACs", async () => {
    const fileData = Buffer.from(mockValidUacImportCsv);

    const result = await getUacsFromFile(fileData);

    expect(result).toHaveLength(4);
    expect(result).toContain("123412341234");
    expect(result).toContain("432143214321");
    expect(result).toContain("678967896789");
    expect(result).toContain("987698769876");
  });

  it("Throws an error when columns are invalid", async () => {
    const fileData = Buffer.from(mockValidSampleCsv);

    await expect(getUacsFromFile(fileData)).rejects.toThrow(
      "Column UAC is not in the CSV file. Column names are case sensitive.",
    );
  });

  it("Rejects when the CSV stream emits an error (duplicate column headers)", async () => {
    const fileData = Buffer.from(mockDuplicateColumnSampleCsv);

    await expect(getUacsFromFile(fileData, "UAC")).rejects.toThrow(
      "There is a problem with the CSV file, please ensure all column headings are unique",
    );
  });

  it("Rejects when a UAC value is not exactly 12 digits", async () => {
    const fileData = Buffer.from("UAC\n123\n");

    await expect(getUacsFromFile(fileData)).rejects.toThrow(
      'UAC column "UAC" contains an invalid value on row 2',
    );
  });
});

describe("getCaseIdsFromFile tests", () => {
  it("Valid CSV - expected case ids returned", async () => {
    const fileData = Buffer.from(mockValidSampleCsv);

    const result = await getCaseIdsFromFile(fileData);

    expect(result).toContain("100000001");
    expect(result).toContain("100000002");
    expect(result).toContain("100000003");
  });

  it("Missing column - error", async () => {
    const fileData = Buffer.from(mockValidUacImportCsv);

    await expect(getCaseIdsFromFile(fileData)).rejects.toThrow(
      "Column serial_number is not in the CSV file. Column names are case sensitive.",
    );
  });

  it("Invalid CSV - error", async () => {
    const fileData = Buffer.from(mockInvalidSampleCsv);

    await expect(getCaseIdsFromFile(fileData)).rejects.toThrow(
      "There is a problem with the CSV file",
    );
  });

  it("Duplicate column - error", async () => {
    const fileData = Buffer.from(mockDuplicateColumnSampleCsv);

    await expect(getCaseIdsFromFile(fileData)).rejects.toThrow(
      "There is a problem with the CSV file, please ensure all column headings are unique",
    );
  });

  it("contains duplicate serial numbers", async () => {
    const fileData = Buffer.from(mockValidSampleCsvWithDuplicateSerialNumbers);

    await expect(getCaseIdsFromFile(fileData)).rejects.toThrow(
      "There is a problem with the CSV file, please ensure all IDs in the serial_number column are unique",
    );
  });
});

describe("addUacsToFile tests", () => {
  it("Adds expected UAC chunks to the CSV where there are no UAC entries in the file", async () => {
    const fileData = Buffer.from(mockValidSampleCsv);

    const result = await addUacsToFile(fileData, mockMatchedQuestionnaireUacDetails);

    expect(result).toHaveLength(3);
    expect(result).toContainEqual({
      serial_number: "100000001",
      Name: "Homer Simpson",
      "Phone Number": "5551234422",
      Email: "homer@springfield.com",
      UAC1: "0009",
      UAC2: "7565",
      UAC3: "3827",
      UAC: "000975653827",
    });
    expect(result).toContainEqual({
      serial_number: "100000002",
      Name: "Seymour Skinner",
      "Phone Number": "1235663322",
      Email: "a@b.c",
      UAC1: "3453",
      UAC2: "6545",
      UAC3: "4564",
      UAC: "345365454564",
    });
    expect(result).toContainEqual({
      serial_number: "100000003",
      Name: "Bart Simpson",
      "Phone Number": "2675465026",
      Email: "bart@spring.field",
      UAC1: "9789",
      UAC2: "7578",
      UAC3: "5367",
      UAC: "978975785367",
    });
  });

  it("Adds expected 16 digit UAC chunks to the CSV where there are no UAC entries in the file", async () => {
    const fileData = Buffer.from(mockValidSampleCsv);

    const result = await addUacsToFile(fileData, mockMatchedQuestionnaireUac16Details);

    expect(result).toHaveLength(3);
    expect(result).toContainEqual({
      serial_number: "100000001",
      Name: "Homer Simpson",
      "Phone Number": "5551234422",
      Email: "homer@springfield.com",
      UAC1: "0009",
      UAC2: "7565",
      UAC3: "3827",
      UAC4: "7512",
      UAC: "0009756538277512",
    });
    expect(result).toContainEqual({
      serial_number: "100000002",
      Name: "Seymour Skinner",
      "Phone Number": "1235663322",
      Email: "a@b.c",
      UAC1: "3453",
      UAC2: "6545",
      UAC3: "4564",
      UAC4: "3213",
      UAC: "3453654545643213",
    });
    expect(result).toContainEqual({
      serial_number: "100000003",
      Name: "Bart Simpson",
      "Phone Number": "2675465026",
      Email: "bart@spring.field",
      UAC1: "9789",
      UAC2: "7578",
      UAC3: "5367",
      UAC4: "8765",
      UAC: "9789757853678765",
    });
  });

  it("Adds expected UAC chunks to the CSV where there are are existing UAC columns in the file", async () => {
    const fileData = Buffer.from(mockValidSampleCsvWithExistingUacColumns);

    const result = await addUacsToFile(fileData, mockMatchedQuestionnaireUacDetails);

    expect(result).toHaveLength(3);
    expect(result).toContainEqual({
      serial_number: "100000001",
      Name: "Homer Simpson",
      UAC1: "0009",
      UAC2: "7565",
      UAC3: "3827",
      UAC: "000975653827",
      "Phone Number": "5551234422",
      Email: "homer@springfield.com",
    });
    expect(result).toContainEqual({
      serial_number: "100000002",
      Name: "Seymour Skinner",
      UAC1: "3453",
      UAC2: "6545",
      UAC3: "4564",
      UAC: "345365454564",
      "Phone Number": "1235663322",
      Email: "a@b.c",
    });
    expect(result).toContainEqual({
      serial_number: "100000003",
      Name: "Bart Simpson",
      UAC1: "9789",
      UAC2: "7578",
      UAC3: "5367",
      UAC: "978975785367",
      "Phone Number": "2675465026",
      Email: "bart@spring.field",
    });
  });

  it("Overwrites UAC chunks to the CSV where there are are existing UAC entries in the file", async () => {
    const fileData = Buffer.from(mockValidSampleCsvWithExistingUacEntries);

    const result = await addUacsToFile(fileData, mockMatchedQuestionnaireUacDetails);

    expect(result).toHaveLength(3);
    expect(result).toContainEqual({
      serial_number: "100000001",
      Name: "Homer Simpson",
      UAC1: "0009",
      UAC2: "7565",
      UAC3: "3827",
      UAC: "000975653827",
      "Phone Number": "5551234422",
      Email: "homer@springfield.com",
    });
    expect(result).toContainEqual({
      serial_number: "100000002",
      Name: "Seymour Skinner",
      UAC1: "3453",
      UAC2: "6545",
      UAC3: "4564",
      UAC: "345365454564",
      "Phone Number": "1235663322",
      Email: "a@b.c",
    });
    expect(result).toContainEqual({
      serial_number: "100000003",
      Name: "Bart Simpson",
      UAC1: "9789",
      UAC2: "7578",
      UAC3: "5367",
      UAC: "978975785367",
      "Phone Number": "2675465026",
      Email: "bart@spring.field",
    });
  });

  it("Unmatched questionnaire UAC results - returns an empty array", async () => {
    const fileData = Buffer.from(mockValidSampleCsv);

    await expect(addUacsToFile(fileData, mockUnMatchedQuestionnaireUacDetails)).rejects.toThrow(
      "The sample file contains a case ID that does not match generated UACs",
    );
  });

  it("Partial Matched questionnaire UAC results - returns a validation error", async () => {
    const fileData = Buffer.from(mockValidSampleCsv);

    await expect(
      addUacsToFile(fileData, mockPartialMatchedQuestionnaireUacDetails),
    ).rejects.toThrow("The sample file contains a case ID that does not match generated UACs");
  });

  it("Empty questionnaire UAC results - returns a validation error", async () => {
    const fileData = Buffer.from(mockValidSampleCsv);

    await expect(addUacsToFile(fileData, mockEmptyQuestionnaireUacDetails)).rejects.toThrow(
      "The sample file contains a case ID that does not match generated UACs",
    );
  });

  it("Invalid CSV - returns a validation error", async () => {
    const fileData = Buffer.from(mockInvalidSampleCsv);

    await expect(addUacsToFile(fileData, mockEmptyQuestionnaireUacDetails)).rejects.toThrow(
      "There is a problem with the CSV file",
    );
  });

  it("Uploaded CSV with lowercase UAC headings - returns CSV with those columns populated", async () => {
    const fileData = Buffer.from(mockValidSampleCsvWithExistingLowercaseUacColumns);

    const result = await addUacsToFile(fileData, mockMatchedQuestionnaireUacDetails);

    expect(result).toHaveLength(3);
    expect(result).toContainEqual({
      serial_number: "100000001",
      Name: "Homer Simpson",
      uac1: "0009",
      uac2: "7565",
      uac3: "3827",
      UAC: "000975653827",
      "Phone Number": "5551234422",
      Email: "homer@springfield.com",
    });
    expect(result).toContainEqual({
      serial_number: "100000002",
      Name: "Seymour Skinner",
      uac1: "3453",
      uac2: "6545",
      uac3: "4564",
      UAC: "345365454564",
      "Phone Number": "1235663322",
      Email: "a@b.c",
    });
    expect(result).toContainEqual({
      serial_number: "100000003",
      Name: "Bart Simpson",
      uac1: "9789",
      uac2: "7578",
      uac3: "5367",
      UAC: "978975785367",
      "Phone Number": "2675465026",
      Email: "bart@spring.field",
    });
  });

  it("Omits UAC4 and UAC columns when uac4 and full_uac are falsy", async () => {
    const uacDetailsNoFullUac: Record<string, unknown> = {
      "100000001": {
        questionnaire_name: "dst2106a",
        case_id: "100000001",
        uac_chunks: { uac1: "0009", uac2: "7565", uac3: "3827" },
        full_uac: "",
        disabled: false,
      },
    };
    const singleRowCsv = `serial_number,Name\n100000001,Homer Simpson`;
    const fileData = Buffer.from(singleRowCsv);

    const result = await addUacsToFile(fileData, uacDetailsNoFullUac as never);

    expect(result).toHaveLength(1);
    expect(result[0]).not.toHaveProperty("UAC4");
    expect(result[0]).not.toHaveProperty("UAC");
  });

  it("Uploaded CSV with mixed case UAC headings - returns CSV with those columns populated", async () => {
    const fileData = Buffer.from(mockValidSampleCsvWithExistingMixedCaseUacColumns);

    const result = await addUacsToFile(fileData, mockMatchedQuestionnaireUacDetails);

    expect(result).toHaveLength(3);
    expect(result).toContainEqual({
      serial_number: "100000001",
      Name: "Homer Simpson",
      UaC1: "0009",
      UaC2: "7565",
      UaC3: "3827",
      UAC: "000975653827",
      "Phone Number": "5551234422",
      Email: "homer@springfield.com",
    });
    expect(result).toContainEqual({
      serial_number: "100000002",
      Name: "Seymour Skinner",
      UaC1: "3453",
      UaC2: "6545",
      UaC3: "4564",
      UAC: "345365454564",
      "Phone Number": "1235663322",
      Email: "a@b.c",
    });
    expect(result).toContainEqual({
      serial_number: "100000003",
      Name: "Bart Simpson",
      UaC1: "9789",
      UaC2: "7578",
      UaC3: "5367",
      UAC: "978975785367",
      "Phone Number": "2675465026",
      Email: "bart@spring.field",
    });
  });
});

describe("csvParser fail guards", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.doUnmock("fast-csv");
  });

  it("ignores subsequent getCaseIdsFromFile failures after the first one", async () => {
    vi.doMock("fast-csv", () => ({
      parseStream: () =>
        createMockParser([
          ["headers", []],
          ["error", new Error("Duplicate headers found")],
          ["end", undefined],
        ]),
    }));

    const { getCaseIdsFromFile } = await import("./csvParser.js");

    await expect(getCaseIdsFromFile("serial_number\n100000001\n")).rejects.toThrow(
      "Column serial_number is not in the CSV file. Column names are case sensitive.",
    );
  });

  it("maps non-Error values thrown while reading case IDs to a CSV validation error", async () => {
    vi.doMock("fast-csv", () => ({
      parseStream: () =>
        createMockParser([
          ["headers", ["serial_number"]],
          ["data", {}],
          ["end", undefined],
        ]),
    }));
    vi.doMock("../validation.js", async (importOriginal) => {
      const mod = await importOriginal<typeof ValidationModule>();

      return {
        ...mod,
        readRequiredCsvField: () => {
          throw "plain failure";
        },
      };
    });

    const { getCaseIdsFromFile } = await import("./csvParser.js");

    await expect(getCaseIdsFromFile("serial_number\n100000001\n")).rejects.toThrow(
      "There is a problem with the CSV file",
    );
  });

  it("ignores subsequent getUacsFromFile failures after the first one", async () => {
    vi.doMock("fast-csv", () => ({
      parseStream: () =>
        createMockParser([
          ["headers", ["serial_number"]],
          ["error", new Error("Duplicate headers found")],
          ["end", undefined],
        ]),
    }));

    const { getUacsFromFile } = await import("./csvParser.js");

    await expect(getUacsFromFile("serial_number\n100000001\n")).rejects.toThrow(
      "Column UAC is not in the CSV file. Column names are case sensitive.",
    );
  });

  it("maps non-Error values thrown while reading UACs to a CSV validation error", async () => {
    vi.doMock("fast-csv", () => ({
      parseStream: () =>
        createMockParser([
          ["headers", ["UAC"]],
          ["data", {}],
          ["end", undefined],
        ]),
    }));
    vi.doMock("../validation.js", async (importOriginal) => {
      const mod = await importOriginal<typeof ValidationModule>();

      return {
        ...mod,
        readRequiredCsvField: () => {
          throw "plain failure";
        },
      };
    });

    const { getUacsFromFile } = await import("./csvParser.js");

    await expect(getUacsFromFile("UAC\n123456789012\n")).rejects.toThrow(
      "There is a problem with the CSV file",
    );
  });

  it("ignores subsequent addUacsToFile failures after the first one", async () => {
    vi.doMock("fast-csv", () => ({
      parseStream: () =>
        createMockParser([
          ["headers", ["Name"]],
          ["error", new Error("Duplicate headers found")],
          ["end", undefined],
        ]),
    }));

    const { addUacsToFile } = await import("./csvParser.js");

    await expect(addUacsToFile("Name\nHomer\n", {} as never)).rejects.toThrow(
      "Column serial_number is not in the CSV file. Column names are case sensitive.",
    );
  });
});
