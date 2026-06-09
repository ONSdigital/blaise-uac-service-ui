import { Readable } from "stream";

import { parseStream } from "fast-csv";

import {
  CsvValidationError,
  isValidUac,
  readRequiredCsvField,
  toStringRecord,
} from "../validation.js";

import type { UacsByCaseId } from "blaise-uac-service-node-client";

function mapCsvParserError(error: Error): CsvValidationError {
  if (error.message.includes("Duplicate headers found")) {
    return new CsvValidationError(
      "There is a problem with the CSV file, please ensure all column headings are unique",
    );
  }

  return new CsvValidationError("There is a problem with the CSV file");
}

export async function getUacsFromFile(
  fileData: string | Buffer,
  uacColumn = "UAC",
): Promise<string[]> {
  const readStream = Readable.from(fileData);

  return new Promise((resolve, reject) => {
    const uacs: string[] = [];
    let settled = false;
    let rowNumber = 1;

    const parser = parseStream(readStream, {
      headers: true,
      ignoreEmpty: true,
      discardUnmappedColumns: true,
    });

    function fail(error: Error): void {
      if (settled) {
        return;
      }

      settled = true;
      reject(error);
      parser.destroy();
    }

    parser
      .on("headers", (headers: string[]) => {
        if (!headers.includes(uacColumn)) {
          fail(
            new CsvValidationError(
              `Column ${uacColumn} is not in the CSV file. Column names are case sensitive.`,
            ),
          );
        }
      })
      .on("error", (error) => {
        fail(mapCsvParserError(error));
      })
      .on("data", (row: unknown) => {
        rowNumber += 1;

        try {
          const uac = readRequiredCsvField(
            row,
            uacColumn,
            `UAC column "${uacColumn}" contains an empty value on row ${rowNumber}`,
          );

          if (!isValidUac(uac)) {
            throw new CsvValidationError(
              `UAC column "${uacColumn}" contains an invalid value on row ${rowNumber}`,
            );
          }

          uacs.push(uac);
        } catch (error) {
          fail(
            error instanceof Error
              ? error
              : new CsvValidationError("There is a problem with the CSV file"),
          );
        }
      })
      .on("end", () => {
        if (!settled) {
          resolve(uacs);
        }
      });
  });
}

export function getCaseIdsFromFile(fileData: string | Buffer): Promise<string[]> {
  const readStream = Readable.from(fileData);

  return new Promise((resolve, reject) => {
    const caseIds: string[] = [];
    const seenCaseIds = new Set<string>();
    let settled = false;

    const parser = parseStream(readStream, { headers: true, ignoreEmpty: true });

    function fail(error: Error): void {
      if (settled) {
        return;
      }

      settled = true;
      reject(error);
      parser.destroy();
    }

    parser
      .on("headers", (headers: string[]) => {
        if (!headers.includes("serial_number")) {
          fail(
            new CsvValidationError(
              "Column serial_number is not in the CSV file. Column names are case sensitive.",
            ),
          );
        }
      })
      .on("error", (error) => {
        fail(mapCsvParserError(error));
      })
      .on("data", (row: unknown) => {
        try {
          const serialNumber = readRequiredCsvField(
            row,
            "serial_number",
            "There is a problem with the CSV file, please ensure the serial_number column contains a value for every row",
          );

          if (seenCaseIds.has(serialNumber)) {
            throw new CsvValidationError(
              "There is a problem with the CSV file, please ensure all IDs in the serial_number column are unique",
            );
          }

          seenCaseIds.add(serialNumber);
          caseIds.push(serialNumber);
        } catch (error) {
          fail(
            error instanceof Error
              ? error
              : new CsvValidationError("There is a problem with the CSV file"),
          );
        }
      })
      .on("end", () => {
        if (!settled) {
          resolve(caseIds);
        }
      });
  });
}

export function addUacsToFile(
  fileData: string | Buffer,
  questionnaireUacDetails: UacsByCaseId,
): Promise<Record<string, string>[]> {
  const readStream = Readable.from(fileData);
  const uacHeading1 = "UAC1";
  const uacHeading2 = "UAC2";
  const uacHeading3 = "UAC3";
  const uacHeading4 = "UAC4";
  const uacHeadingFull = "UAC";
  const uacHeadings = [uacHeading1, uacHeading2, uacHeading3, uacHeading4, uacHeadingFull];

  return new Promise((resolve, reject) => {
    const results: Record<string, string>[] = [];
    let settled = false;
    let rowNumber = 1;

    const parser = parseStream(readStream, { headers: true, ignoreEmpty: true });

    function fail(error: Error): void {
      if (settled) {
        return;
      }

      settled = true;
      reject(error);
      parser.destroy();
    }

    parser
      .on("headers", (headers: string[]) => {
        if (!headers.includes("serial_number")) {
          fail(
            new CsvValidationError(
              "Column serial_number is not in the CSV file. Column names are case sensitive.",
            ),
          );

          return;
        }

        headers.forEach(function (string) {
          uacHeadings.forEach(function (heading, index) {
            if (string.localeCompare(heading, "en", { sensitivity: "accent" }) == 0) {
              uacHeadings[index] = string;
            }
          });
        });
      })
      .on("error", (error) => {
        fail(mapCsvParserError(error));
      })
      .on("data", (row: unknown) => {
        rowNumber += 1;

        const line = toStringRecord(row);
        const serialNumber = readRequiredCsvField(
          line,
          "serial_number",
          "There is a problem with the CSV file, please ensure the serial_number column contains a value for every row",
        );
        const uacDetails = questionnaireUacDetails[serialNumber];

        if (!uacDetails) {
          fail(
            new CsvValidationError(
              `The sample file contains a case ID that does not match generated UACs on row ${rowNumber}`,
            ),
          );

          return;
        }

        results.push(mapUacChunk(uacHeadings, line, uacDetails));
      })
      .on("end", () => {
        if (!settled) {
          resolve(results);
        }
      });
  });
}

function mapUacChunk(
  uacHeadings: string[],
  line: Record<string, string>,
  uacDetails: UacsByCaseId[string],
): Record<string, string> {
  line[uacHeadings[0]] = uacDetails.uac_chunks.uac1;
  line[uacHeadings[1]] = uacDetails.uac_chunks.uac2;
  line[uacHeadings[2]] = uacDetails.uac_chunks.uac3;

  if (uacDetails.uac_chunks.uac4) {
    line[uacHeadings[3]] = uacDetails.uac_chunks.uac4;
  }

  if (uacDetails.full_uac) {
    line[uacHeadings[4]] = uacDetails.full_uac;
  }

  return line;
}
