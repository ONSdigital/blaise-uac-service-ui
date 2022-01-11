import { Readable } from "stream";
import { InstrumentUacDetailsByCaseId } from "blaise-uac-service-node-client";
import { parseStream } from "fast-csv";

export async function getUacsFromFile(fileData: string | Buffer, uacColumn = "Full_UAC"): Promise<string[]> {
    const readStream = Readable.from(fileData);

    return new Promise((resolve, reject) => {
        const uacs: string[] = [];
        parseStream(readStream, { headers: true, ignoreEmpty: true, discardUnmappedColumns: true })
            .on("headers", (headers: string[]) => {
                if (!headers.includes(uacColumn)) {
                    reject(new Error(`UAC column "${uacColumn}" not in CSV`));
                }
            })
            .on("error", (error) => {
                reject(error);
            })
            .on("data", (row) => {
                uacs.push(row[uacColumn]);
            })
            .on("end", () => {
                resolve(uacs);
            });
    });
}

export function getCaseIdsFromFile(fileData: string | Buffer): Promise<string[]> {
    const readStream = Readable.from(fileData);

    return new Promise((resolve, reject) => {
        const caseIds: string[] = [];
        parseStream(readStream, { headers: true, ignoreEmpty: true })
            .on("headers", (headers: string[]) => {
                if (!headers.includes("serial_number")) {
                    console.error("Missing column 'serial_number'");
                    resolve([]);
                }
            })
            .on("error", (error) => {
                console.error(error.message);
                resolve([]);
            })
            .on("data", (row) => {
                caseIds.push(row.serial_number);
            })
            .on("end", () => {
                resolve(caseIds);
            });
    });
}

export function addUacCodesToFile(fileData: string | Buffer, instrumentUacDetails: InstrumentUacDetailsByCaseId): Promise<Record<string, string>[]> {
    const readStream = Readable.from(fileData);

    return new Promise((resolve, reject) => {
        const results: Record<string, string>[] = [];
        parseStream(readStream, { headers: true, ignoreEmpty: true })
            .validate((row: any): boolean => {
                if (!instrumentUacDetails[row.serial_number]) {
                    return false;
                }
                return true;
            })
            .on("data-invalid", (row) => {
                console.error(`No UAC chunks found that matches the case id ${row.serial_number}`);
                resolve([]);
            })
            .on("error", (error) => {
                console.error(error.message);
                resolve([]);
            })
            .on("data", (row) => {
                results.push(mapUacChunk(row, instrumentUacDetails));
            })
            .on("end", () => {
                resolve(results);
            });
    });
}

function mapUacChunk(line: Record<string, string>, instrumentUacDetails: InstrumentUacDetailsByCaseId): Record<string, string> {
    const uacDetails = instrumentUacDetails[line.serial_number];

    line["UAC1"] ? line["UAC1"] = uacDetails.uac_chunks.uac1 : line.UAC1 = uacDetails.uac_chunks.uac1;
    line["UAC2"] ? line["UAC2"] = uacDetails.uac_chunks.uac2 : line.UAC2 = uacDetails.uac_chunks.uac2;
    line["UAC3"] ? line["UAC3"] = uacDetails.uac_chunks.uac3 : line.UAC3 = uacDetails.uac_chunks.uac3;

    if (uacDetails.uac_chunks.uac4) {
        line["UAC4"] ? line["UAC4"] = uacDetails.uac_chunks.uac4 : line.UAC4 = uacDetails.uac_chunks.uac4;
    }

    if (uacDetails.full_uac) {
        line["UAC"] ? line["UAC"] = uacDetails.full_uac : line.UAC = uacDetails.full_uac;
    }

    return line;
}
