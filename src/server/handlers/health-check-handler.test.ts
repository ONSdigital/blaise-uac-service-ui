import server from "./../server";
import supertest from "supertest";

const request = supertest(server);

describe("Test Heath Endpoint", () => {
    it("should return a 200 status and json message", async () => {
        const response = await request.get("/bus-ui/version/health");

        expect(response.statusCode).toEqual(200);
        expect(response.body).toStrictEqual({healthy: true});
    });
});
