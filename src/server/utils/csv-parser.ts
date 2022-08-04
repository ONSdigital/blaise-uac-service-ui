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
                    reject(new Error("Missing column 'serial_number'"));
                }
            })
            .on("error", (error) => {
                console.error(error.message);
                if (error.message.includes("Duplicate headers found")) {
                    reject(new Error("There is a problem with the CSV file, please ensure all column headings are unique"));
                }
                reject(new Error("There is a problem with the CSV file"));
            })
            .on("data", (row) => {
                if(caseIds.includes(row.serial_number)){
                    reject(new Error("There is a problem with the CSV file, please ensure all IDs in the serial_number column are unique"));
                }
                caseIds.push(row.serial_number);
            })
            .on("end", () => {
                resolve(caseIds);
            });
    });
}

export function addUacCodesToFile(fileData: string | Buffer, instrumentUacDetails: InstrumentUacDetailsByCaseId): Promise<Record<string, string>[]> {
    const readStream = Readable.from(fileData);
    const uacHeading1 = "UAC1";
    const uacHeading2 = "UAC2";
    const uacHeading3 = "UAC3";
    const uacHeading4 = "UAC4";
    const uacHeadingFull = "UAC";
    const uacHeadings = [uacHeading1, uacHeading2, uacHeading3, uacHeading4, uacHeadingFull];

    return new Promise((resolve) => {
        const results: Record<string, string>[] = [];
        parseStream(readStream, { headers: true, ignoreEmpty: true })
            .validate((row: any): boolean => {
                if (!instrumentUacDetails[row.serial_number]) {
                    return false;
                }
                return true;
            })
            .on("headers", (headers: string[]) => { 
                headers.forEach(function (string){
                    uacHeadings.forEach(function (heading){
                        if ((string.localeCompare(heading, "en", { sensitivity: "accent" }) == 0)){
                            const index = uacHeadings.indexOf(heading);
                            if (~index){
                                uacHeadings[index] = string;
                            }
                        }    
                    });
                });
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
                results.push(mapUacChunk(uacHeadings, row, instrumentUacDetails));
            })
            .on("end", () => {
                resolve(results);
            });
    });
}

function mapUacChunk(uacHeadings: string[], line: Record<string, string>, instrumentUacDetails: InstrumentUacDetailsByCaseId): Record<string, string> {
    const uacDetails = instrumentUacDetails[line.serial_number];
       
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
