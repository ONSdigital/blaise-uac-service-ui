import app from "./server"; 
import supertest from "supertest";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";

const request = supertest(app);

const mock = new MockAdapter(axios, {onNoMatch: "throwException"});

describe("Test Heath Endpoint", () => {
    it("should return a 200 status and json message", async done => {
        const response = await request.get("/uac-ui/version/health");

        expect(response.statusCode).toEqual(200);
        expect(response.body).toStrictEqual({healthy: true});
        done();
    });
});