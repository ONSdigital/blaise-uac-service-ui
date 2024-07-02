import axios, { AxiosRequestConfig } from "axios";
import { AuthManager } from "blaise-login-react/blaise-login-react-client";
import { Datas } from "react-csv-downloader/dist/esm/lib/csv";

function axiosConfig(): AxiosRequestConfig {
    const authManager = new AuthManager();
    return {
        headers: authManager.authHeader()
    };
}

export async function importUacsFromFile(file: File | undefined): Promise<number> {
    if (file === undefined) {
        throw new Error("file was not supplied");
    }

    const allowedFileTypes = /(\.csv)$/i;
    if (!allowedFileTypes.exec(file.name)) {
        throw new Error("File format is not CSV");
    }

    const data = new FormData();
    data.append("file", file);

    return axios.post("/api/v1/uac/import", data, axiosConfig())
        .then((response) => {
            console.log("import-file-function - true");
            console.log(response.data);
            return response.data?.uacs_imported;
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

    return axios.post(`/api/v1/instrument/${instrumentName}/uac/sample`, data, axiosConfig())
        .then(() => {
            console.log("file-functions - true");
            return true;
        })
        .catch((error) => {
            console.log("file-functions - false");
            console.error(`Something went wrong in calling generate UAC endpoint ${error}`);
            throw error;
        });
}

export async function getSampleFileWithUacCodes(instrumentName: string | undefined, fileName: string | undefined): Promise<Datas> {
    if (instrumentName === undefined) {
        throw new Error("Questionnaire name was not supplied");
    }

    if (fileName === undefined) {
        throw new Error("file name was not supplied");
    }

    const response = await axios.get(`/api/v1/instrument/${instrumentName}/uac/sample/${fileName}`, axiosConfig());

    return response.data;
}

export async function sampleFileAlreadyExists(instrumentName: string | undefined): Promise<boolean> {
    if (instrumentName === undefined) {
        throw new Error("Questionnaire name was not supplied");
    }

    const fileName = getFileName(instrumentName);
    return axios.get(`/api/v1/file/${fileName}/exists`, axiosConfig())
        .then((response) => response.data === true)
        .catch((error) => {
            console.error(error);
            return false;
        });
}

export async function getListOfInstrumentsWhichHaveExistingSampleFiles(): Promise<string[]> {
    const response = await axios.get("/api/v1/instruments", axiosConfig());

    return response.data;
}

export function getFileName(instrumentName: string): string {
    return `${instrumentName}.csv`;
}
