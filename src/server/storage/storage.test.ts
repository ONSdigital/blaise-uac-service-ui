import {uploadFile} from "./storage";
import {getMockReq, getMockRes} from "@jest-mock/express";
import {fileMock} from "./../../mocks/FileMock";

const {res, next, mockClear} = getMockRes();
const sampleFile = fileMock({
    name: "sample.csv",
    type: "image/png",
    size: 50000,
});

describe("Should return 400 bad request if instrument name or file is not provided", () => {
    beforeEach(() => {
        mockClear();
    });

    it("It should return 404 if an instrument name is not provided", async () => {

        const req = getMockReq({
            body: {},
            file: sampleFile
        });

        await uploadFile(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith("Instrument name not supplied");
    });

    it("It should return 404 if a file is not provided", async () => {

        const req = getMockReq({
            body: { "instrumentName": "DST2012A"}
        });

        await uploadFile(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith("File not supplied");
    });
});

