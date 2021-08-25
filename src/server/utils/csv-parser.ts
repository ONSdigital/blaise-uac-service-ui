import {Readable} from "stream";
import {InstrumentUacDetails} from "../api-clients/BusApi/interfaces/instrument-uac-details";
import {StringStream} from "scramjet";

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
        .setOptions({maxParallel: 32})
        .map(({serial_number}) => caseIds.push(serial_number))
        .catch((error: Error) => {
            console.error(error.message);
            hasErrored = true;
        })
        .run()
        .then(() => {
            return hasErrored === false ? caseIds : [];
        });
}

export function addUacCodesToFile(fileData: string | Buffer, instrumentUacDetails: InstrumentUacDetails): Promise<string[]> {
    const readStream = Readable.from(fileData);
    let hasErrored = false;

    return StringStream.from(readStream)
        .CSVParse({
            skipEmptyLines: true,
            header: true,
        })
        .setOptions({maxParallel: 32})
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

function mapUacChunk(line: any, instrumentUacDetails: InstrumentUacDetails) {
    for (const key in instrumentUacDetails) {
        const value = instrumentUacDetails[key];
        if (value.case_id === line.serial_number) {
            line["UAC1"] ? line["UAC1"] = value.uac_chunks.uac1 : line.UAC1 = value.uac_chunks.uac1;
            line["UAC2"] ? line["UAC2"] = value.uac_chunks.uac2 : line.UAC2 = value.uac_chunks.uac2;
            line["UAC3"] ? line["UAC3"] = value.uac_chunks.uac3 : line.UAC3 = value.uac_chunks.uac3;

            return;
        }
    }

    throw new Error(`No UAC chunks found that matches the case id ${line.serial_number}`);
}
