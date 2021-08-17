import {getMockReq, getMockRes} from "@jest-mock/express";
import {uploadFile} from "./file-upload-handler";
import {multerFileMock} from "./../../mocks/FileMock";

jest.mock("./../storage/google-storage-functions");
import {uploadFileToBucket} from "./../storage/google-storage-functions";

const {res, mockClear} = getMockRes();
const instrumentName = "DST1234A";

const sampleFile = multerFileMock({
    filename: "sample.csv",
    path: "/temp/sample.csv",
    mimetype: "image/png",
    size: 50000,
});

describe("file-upload-handler tests", () => {
    beforeEach(() => {
        mockClear();
    });

    const uploadFileToBucketMock = uploadFileToBucket as jest.Mock<Promise<void>>;

    it("It should return a 400 if an filename is not provided", async () => {
        const req = getMockReq();
        req.file = sampleFile;
        await uploadFile(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith("Filename not supplied");
    });

    it("It should return a 400 if an file is not provided", async () => {
        const req = getMockReq();
        req.body.fileName = `${instrumentName}.csv`;
        await uploadFile(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith("File not supplied");
    });

    it("It should be called with correct parameters with filename converted to lowercase", async () => {
        uploadFileToBucketMock.mockImplementationOnce(() => {
            return Promise.resolve();
        });

        const req = getMockReq();
        req.body.fileName = `${instrumentName}.csv`;
        req.file = sampleFile;
        await uploadFile(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(uploadFileToBucketMock).toHaveBeenCalledWith("unique-bucket", sampleFile, `${instrumentName.toLowerCase()}.csv`);
    });


    it("It should return a 201 response if upload is successful", async () => {
        uploadFileToBucketMock.mockImplementationOnce(() => {
            return Promise.resolve();
        });

        const req = getMockReq();
        req.body.fileName = `${instrumentName}.csv`;
        req.file = sampleFile;
        await uploadFile(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
    });

    it("It should return a 500 response if the upload fails", async () => {
        uploadFileToBucketMock.mockImplementationOnce(() => {
            return Promise.reject();
        });

        const req = getMockReq();
        req.body.fileName = `${instrumentName}.csv`;
        req.file = sampleFile;
        await uploadFile(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});



