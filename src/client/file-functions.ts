import axios from "axios";
import {Datas} from "react-csv-downloader/dist/esm/lib/csv";

export async function importUacsFromFile(file: File | undefined): Promise<number> {
    if (file === undefined) {
        throw new Error("file was not supplied");
    }

    const data = new FormData();
    data.append("file", file);

    const config = {
        headers: { "Content-Type": "multipart/form-data" },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
    };

    return axios.post("/api/v1/uac/import", data, config)
    .then((response) => {
        console.log("import-file-function - true");
        console.log(response.data);
        return response.data.uacs_imported;
    })
    .catch((error) => {
        console.log("import-file-function - false");
        console.error(`Something went wrong importing uacs ${error}`);
        throw error;
    });
}

export async function generateUacCodesForSampleFile(instrumentName: string | undefined, file: File | undefined): Promise<boolean> {
    if (instrumentName === undefined) {
        throw new Error("Questionnaire name was not supplied");
    }

    if (file === undefined) {
        throw new Error("file was not supplied");
    }

    const data = new FormData();
    data.append("fileName", getFileName(instrumentName));
    data.append("file", file);

    const config = {headers: {"Content-Type": "multipart/form-data"}};

    return axios.post(`/api/v1/instrument/${instrumentName}/uac/sample`, data, config)
        .then(() => {
            console.log("file-functions - true");
            return true;
        })
        .catch((error) => {
            console.log("file-functions - false");
            console.error(`Something went wrong in calling generate UAC endpoint ${error}`);
            return false;
        });

    console.log("file-functions - balls");
    return false;
}

export async function getSampleFileWithUacCodes(instrumentName: string | undefined, fileName: string | undefined): Promise<Datas> {
    if (instrumentName === undefined) {
        throw new Error("Questionnaire name was not supplied");
    }

    if (fileName === undefined) {
        throw new Error("file name was not supplied");
    }

    const response = await axios.get(`/api/v1/instrument/${instrumentName}/uac/sample/${fileName}`);

    return response.data;
}

export async function sampleFileAlreadyExists(instrumentName: string | undefined): Promise<boolean> {
    if (instrumentName === undefined) {
        throw new Error("Questionnaire name was not supplied");
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
