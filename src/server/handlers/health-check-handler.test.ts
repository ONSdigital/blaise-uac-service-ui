import server from "./../server";
import supertest from "supertest";

const request = supertest(server);

describe("Test heath check endpoint", () => {
    it("should return a 200 status and json message", async (done) => {

        request
            .get("/uac-ui/version/health")
            .expect(200, {healthy: true})
        done();
    });
});