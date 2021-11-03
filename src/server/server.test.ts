import listEndpoints from "express-list-endpoints";

import server from "./server";

describe("All expected routes are registered", () => {
    const expectedEndpoints = [
        {
            "methods": ["POST"],
            "middlewares": ["multerMiddleware", "ForSampleFile"],
            "path": "/api/v1/instrument/:instrumentName/uac/sample"
        },
        {
            "methods": ["GET"],
            "middlewares": ["GetSampleFileWithUacs"],
            "path": "/api/v1/instrument/:instrumentName/uac/sample/:fileName"
        },
        {"methods": ["GET"], "middlewares": ["fileExists"], "path": "/api/v1/file/:fileName/exists"},
        {"methods": ["GET"], "middlewares": ["GetListOfInstrumentsInBucket"], "path": "/api/v1/instruments"},
        {"methods": ["GET"], "middlewares": ["healthCheck"], "path": "/bus-ui/:version/health"},
        {"methods": ["GET"], "middlewares": ["anonymous"], "path": "*"}];

    it("should contain all expected routes", async () => {
        const endpoints = listEndpoints(server);

        expect(endpoints).toEqual(expectedEndpoints);
    });
});
