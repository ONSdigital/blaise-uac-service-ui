import { Readable } from "stream";
import { InstrumentUacDetailsByCaseId } from "blaise-uac-service-node-client";
import { StringStream } from "scramjet";
import { parseStream } from "fast-csv";

export async function getUacsFromFile(fileData: string | Buffer, uacColumn = "Full_UAC"): Promise<string[]> {
    const readStream = Readable.from(fileData);

    return new Promise((resolve, reject) => {
        const uacs: string[] = [];
        parseStream(readStream, {headers: true, ignoreEmpty: true, discardUnmappedColumns: true})
        .validate((row: any): boolean => {
            return checkImportColumns(row, uacColumn);
        })
        .on("data-invalid", () => {
            reject(new Error(`UAC column "${uacColumn}" not in CSV`));
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
    const caseIds: string[] = [];
    const readStream = Readable.from(fileData);
    let hasErrored = false;

    return StringStream
        .from(readStream)
        .CSVParse({
            skipEmptyLines: true,
            header: true,
        })
        .setOptions({ maxParallel: 32 })
        .map(({ serial_number }) => caseIds.push(serial_number))
        .catch((error: Error) => {
            console.error(error.message);
            hasErrored = true;
        })
        .run()
        .then(() => {
            return hasErrored === false ? caseIds : [];
        });
}

export function addUacCodesToFile(fileData: string | Buffer, instrumentUacDetails: InstrumentUacDetailsByCaseId): Promise<string[]> {
    const readStream = Readable.from(fileData);
    let hasErrored = false;

    return StringStream.from(readStream)
        .CSVParse({
            skipEmptyLines: true,
            header: true,
        })
        .setOptions({ maxParallel: 32 })
        .map((line) => {
            mapUacChunk(line, instrumentUacDetails);
            return line;
        })
        .catch((error: Error) => {
            console.error(error.message);
            hasErrored = true;
        })
        .toArray()
        .then((array) => {
            return hasErrored === false ? array : [];
        });
}

function mapUacChunk(line: any, instrumentUacDetails: InstrumentUacDetailsByCaseId) {
    const uacDetails = instrumentUacDetails[line.serial_number];

    if (!uacDetails) {
        throw new Error(`No UAC chunks found that matches the case id ${line.serial_number}`);
    }

    line["UAC1"] ? line["UAC1"] = uacDetails.uac_chunks.uac1 : line.UAC1 = uacDetails.uac_chunks.uac1;
    line["UAC2"] ? line["UAC2"] = uacDetails.uac_chunks.uac2 : line.UAC2 = uacDetails.uac_chunks.uac2;
    line["UAC3"] ? line["UAC3"] = uacDetails.uac_chunks.uac3 : line.UAC3 = uacDetails.uac_chunks.uac3;

    if (uacDetails.uac_chunks.uac4) {
        line["UAC4"] ? line["UAC4"] = uacDetails.uac_chunks.uac4 : line.UAC4 = uacDetails.uac_chunks.uac4;
    }
}

export function checkImportColumns(row: Record<string, unknown>, uacColumn: string): boolean {
    return (uacColumn in row);
}
