import axios from "axios";

export async function uploadFile(instrumentName: string | undefined, file: File | undefined): Promise<boolean> {
    if (instrumentName === undefined || instrumentName === null) {
        console.error("Instrument name not supplied");
        return false;
    }

    if (file === undefined || file === null) {
        console.error("File not supplied");
        return false;
    }

    const data = new FormData();
    data.append("instrumentName", instrumentName);
    data.append("file", file);

    const config = {headers: {"Content-Type": "multipart/form-data"}};

    return axios.post("/api/v1/upload", data, config)
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
