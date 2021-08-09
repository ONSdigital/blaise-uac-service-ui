import axios from "axios";

export async function uploadFile(instrumentName: string | undefined, file: File | undefined) {
    if (instrumentName === undefined || instrumentName === null) {
        console.error("Instrument name not supplied");
        return null;
    }

    if (file === undefined || file === null) {
        console.error("File not supplied");
        return null;
    }

    const data = new FormData();
    data.append("instrumentName", instrumentName);
    data.append("file", file);

    const config = {headers: {"Content-Type": "multipart/form-data"}};

    await axios.post("/api/v1/upload", data, config);
}
