import AuthProvider from "../authentication/authentication-provider";
import axios from "axios";

export class BusApiClient {
    private readonly BUS_API_URL: string;
    private readonly BUS_CLIENT_ID: string;
    private authProvider: AuthProvider;

    constructor(BUS_API_URL: string, BUS_CLIENT_ID: string) {
        this.BUS_API_URL = BUS_API_URL;
        this.BUS_CLIENT_ID = BUS_CLIENT_ID;
        this.authProvider = new AuthProvider(BUS_CLIENT_ID);
    }

    async Meh() {
        const url = `${this.BUS_API_URL}/uacs/instrument/LMS2107_CC1/count`;

        const authHeader = await this.authProvider.getAuthHeader();
        console.log(authHeader, "Obtained Google auth request header");

        const response = await axios.get(url, {headers: authHeader});

        console.log("Bus response", response);

        return response;
    }
}
