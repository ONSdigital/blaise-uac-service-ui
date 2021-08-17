import axios from "axios";

export async function uploadFile(instrumentName: string | undefined, file: File | undefined): Promise<boolean> {
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

    return axios.post("/api/v1/file/upload", data, config)
        .then(() => {
            console.log("File successfully uploaded");
            return true;
        })
        .catch((error) => {
            console.error(`File failed to upload ${error}`);
            return false;
        });

    return false;
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
