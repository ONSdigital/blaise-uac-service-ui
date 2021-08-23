import axios from "axios";
import * as fs from "fs";

export async function generateUacCodesForFile(instrumentName: string | undefined, file: File | undefined): Promise<boolean> {
    if (instrumentName === undefined) {
        console.error("Instrument name not supplied");
        return false;
    }

    if (file === undefined) {
        console.error("File not supplied");
        return false;
    }

    const data = new FormData();
    data.append("fileName", getFileName(instrumentName));
    data.append("file", file);

    const config = {headers: {"Content-Type": "multipart/form-data"}};

    return axios.post(`/api/v1/instrument/${instrumentName}/uac/sample`, data, config)
        .then(() => {
            console.log("UAC codes generated and file uploaded");
            return true;
        })
        .catch((error) => {
            console.error(`Something went wrong in calling generate UAC endpoint ${error}`);
            return false;
        });

    return false;
}

export async function getSampleFileWithUacCodes(instrumentName: string | undefined, fileName: string | undefined): Promise<string> {

    return axios.get(`/api/v1/instrument/${instrumentName}/uac/sample/${fileName}`)
        .then((response) => {
            return response.data;
        })
        .catch((error) => {
            console.error(`Something went wrong in calling generate UAC endpoint ${error}`);
        });
}

export async function fileExists(instrumentName: string | undefined): Promise<boolean> {
    if (instrumentName === undefined) {
        console.error("Instrument name not supplied");
        return false;
    }

    const fileName = getFileName(instrumentName);
    const exists = await axios.get(`/api/v1/file/${fileName}/exists`);

    return exists.data === true;
}

export function getFileName(instrumentName: string): string {
    return `${instrumentName}.csv`;
}
