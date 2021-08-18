import axios from "axios";

export async function getInstrumentsWithExistingUacCodes() {
    const response = await axios.get("/api/v1/uac");
    console.log("Uac meh response", response);

    return response;
}
