import axios from "axios";
import {Datas} from "react-csv-downloader/dist/esm/lib/csv";
import {Instrument} from "../components/interfaces/instrument";

export async function generateUacCodesForSampleFile(instrumentName: string | undefined, file: File | undefined): Promise<Datas> {
    if (instrumentName === undefined) {
        throw new Error("Instrument name was not supplied");
    }

    if (file === undefined) {
        throw new Error("file was not supplied");
    }

    const data = new FormData();
    data.append("fileName", getFileName(instrumentName));
    data.append("file", file);

    const config = {headers: {"Content-Type": "multipart/form-data"}};

    return axios.post(`/api/v1/instrument/${instrumentName}/uac/sample`, data, config)
        .then((response) => {
            console.log("UAC codes generated and file uploaded");
            console.log("response", response.data);
            return response.data;
        })
        .catch((error) => {
            console.error(`Something went wrong in calling generate UAC endpoint ${error}`);
            return [];
        });

    return [];
}

export async function getSampleFileWithUacCodes(instrumentName: string | undefined, fileName: string | undefined): Promise<Datas> {
    if (instrumentName === undefined) {
        throw new Error("Instrument name was not supplied");
    }

    if (fileName === undefined) {
        throw new Error("file name was not supplied");
    }

    const response = await axios.get(`/api/v1/instrument/${instrumentName}/uac/sample/${fileName}`);

    return response.data;
}

export async function sampleFileAlreadyExists(instrumentName: string | undefined): Promise<boolean> {
    if (instrumentName === undefined) {
        throw new Error("Instrument name was not supplied");
    }

    const fileName = getFileName(instrumentName);
    return axios.get(`/api/v1/file/${fileName}/exists`)
        .then((response) => response.data === true)
        .catch((error) => {
            console.error(error);
            return false;
        });
}

export async function getListOfInstrumentsWhichHaveExistingSampleFiles(): Promise<string[]> {
    const response = await axios.get("/api/v1/instruments");

    return response.data;
}

export function getFileName(instrumentName: string): string {
    return `${instrumentName}.csv`;
}

