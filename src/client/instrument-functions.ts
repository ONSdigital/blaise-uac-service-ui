import axios from "axios";

export async function getInstrumentsWithExistingUacCodes(): Promise<string[]> {
    const response = await axios.get("/api/v1/instruments2");
    console.log("List of instruments: ", response);

    return [];
}
