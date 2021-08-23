import {Readable} from "stream";
import {InstrumentUacDetails} from "../api-clients/BusApi/interfaces/instrument-uac-details";
import {StringStream} from "scramjet";
import Papa from "papaparse";

export function getCaseIdsFromFile(fileData: string | Buffer): Promise<string[]> {

    const caseIds: string[] = [];
    const readStream = Readable.from(fileData);

    return StringStream
        .from(readStream)
        .CSVParse({
            skipEmptyLines: true,
            header: true,
        })
        .setOptions({maxParallel: 32})
        .map(({serial_number}) => caseIds.push(serial_number))
        .catch(() => {
            throw new Error("Failed to parse file");
        })
        .run()
        .then(() => {
            return (caseIds);
        });
}

function getUacChunksForCaseId(instrumentUacDetails: InstrumentUacDetails, caseId: string): string[] {
    for (const key in instrumentUacDetails) {
        const value = instrumentUacDetails[key];
        if (value.case_id === caseId) {
            const uacChunkArray: string[] = [];
            uacChunkArray.push(value.uac_chunks.uac1);
            uacChunkArray.push(value.uac_chunks.uac2);
            uacChunkArray.push(value.uac_chunks.uac3);
            return uacChunkArray;
        }
    }

    throw new Error("Error in retrieving UAC chunks");
}

export async function addUacCodesToFile(fileData: string | Buffer, instrumentUacDetails: InstrumentUacDetails): Promise<any[]> {
    const readStream = Readable.from(fileData);

    return StringStream.from(readStream)
        .CSVParse({
            skipEmptyLines: true,
            header: true,
        })
        .setOptions({maxParallel: 32})
        .map((line) => {
            const uacChunks = getUacChunksForCaseId(instrumentUacDetails, line.serial_number);
            line.uac1 = uacChunks[0];
            line.uac2 = uacChunks[1];
            line.uac3 = uacChunks[2];
            return line;
        })
        .catch(() => {
            return Promise.reject("Failed to parse file");
        })
        .CSVStringify()
        .toArray()
        .then((array) =>  {
            const parsedResults:any = Papa.parse(array.toString(), {header: true, skipEmptyLines: true});
            return parsedResults.data;
        });
}


