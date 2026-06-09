import { type Bucket, type File, Storage } from "@google-cloud/storage";

import { GoogleStorage, SampleFileExistsError } from "./googleStorageFunctions.js";

vi.mock("@google-cloud/storage");

const mockSave = vi.fn();
const mockExists = vi.fn();
const mockGetFiles = vi.fn();
const mockDownload = vi.fn();
const mockFile = vi.fn().mockReturnValue({
  save: mockSave,
  exists: mockExists,
  download: mockDownload,
});
const mockBucket = vi.fn().mockReturnValue({
  file: mockFile,
  getFiles: mockGetFiles,
});

Storage.prototype.bucket = mockBucket as unknown as (name: string, options?: object) => Bucket;

describe("GoogleStorage", () => {
  const projectId = "test-project";
  const bucketName = "test-bucket";
  const fileName = "test-file.csv";
  const googleStorage = new GoogleStorage(projectId);

  beforeEach(() => {
    vi.clearAllMocks();
    mockFile.mockReturnValue({
      save: mockSave,
      exists: mockExists,
      download: mockDownload,
    });
    mockBucket.mockReturnValue({
      file: mockFile,
      getFiles: mockGetFiles,
    });
  });

  it("uploadFileToBucket calls save with the file buffer", async () => {
    mockSave.mockResolvedValue(undefined);

    const multerFile = {
      buffer: Buffer.from("csv content"),
    } as Express.Multer.File;

    await googleStorage.uploadFileToBucket(bucketName, multerFile, fileName);

    expect(mockBucket).toHaveBeenCalledWith(bucketName);
    expect(mockFile).toHaveBeenCalledWith(fileName);
    expect(mockSave).toHaveBeenCalledWith(Buffer.from("csv content"));
  });

  it("uploadFileToBucket prevents overwrite when overwrite is false", async () => {
    mockSave.mockResolvedValue(undefined);

    const multerFile = {
      buffer: Buffer.from("csv content"),
    } as Express.Multer.File;

    await googleStorage.uploadFileToBucket(bucketName, multerFile, fileName, false);

    expect(mockSave).toHaveBeenCalledWith(Buffer.from("csv content"), {
      preconditionOpts: { ifGenerationMatch: 0 },
    });
  });

  it("uploadFileToBucket throws SampleFileExistsError for a 409 conflict when overwrite is false", async () => {
    mockSave.mockRejectedValueOnce({ code: 409 });

    const multerFile = {
      buffer: Buffer.from("csv content"),
    } as Express.Multer.File;

    await expect(
      googleStorage.uploadFileToBucket(bucketName, multerFile, fileName, false),
    ).rejects.toBeInstanceOf(SampleFileExistsError);
  });

  it("uploadFileToBucket throws SampleFileExistsError for a 412 conflict when overwrite is false", async () => {
    mockSave.mockRejectedValueOnce({ code: 412 });

    const multerFile = {
      buffer: Buffer.from("csv content"),
    } as Express.Multer.File;

    await expect(
      googleStorage.uploadFileToBucket(bucketName, multerFile, fileName, false),
    ).rejects.toMatchObject({
      message: `Sample file ${fileName} already exists`,
      name: "SampleFileExistsError",
    });
  });

  it("uploadFileToBucket rethrows non-conflict errors", async () => {
    const error = Object.assign(new Error("save failed"), { code: 500 });

    mockSave.mockRejectedValueOnce(error);

    const multerFile = {
      buffer: Buffer.from("csv content"),
    } as Express.Multer.File;

    await expect(
      googleStorage.uploadFileToBucket(bucketName, multerFile, fileName, false),
    ).rejects.toBe(error);
  });

  it("fileExistsInBucket returns true when file exists", async () => {
    mockExists.mockResolvedValue([true]);

    const result = await googleStorage.fileExistsInBucket(bucketName, fileName);

    expect(mockBucket).toHaveBeenCalledWith(bucketName);
    expect(mockFile).toHaveBeenCalledWith(fileName);
    expect(result).toBe(true);
  });

  it("fileExistsInBucket returns false when file does not exist", async () => {
    mockExists.mockResolvedValue([false]);

    const result = await googleStorage.fileExistsInBucket(bucketName, fileName);

    expect(result).toBe(false);
  });

  it("getFileNamesInBucket returns list of file names", async () => {
    const mockFiles = [{ name: "file1.csv" } as File, { name: "file2.csv" } as File];

    mockGetFiles.mockResolvedValue([mockFiles]);

    const result = await googleStorage.getFileNamesInBucket(bucketName);

    expect(mockBucket).toHaveBeenCalledWith(bucketName);
    expect(result).toEqual(["file1.csv", "file2.csv"]);
  });

  it("getFilesWithMetadataInBucket returns list of file names with updated dates", async () => {
    const mockFiles = [
      { name: "file1.csv", metadata: { updated: "2024-01-15T14:41:29.000Z" } } as unknown as File,
      { name: "file2.csv", metadata: { updated: "2024-03-10T09:00:00.000Z" } } as unknown as File,
    ];

    mockGetFiles.mockResolvedValue([mockFiles]);

    const result = await googleStorage.getFilesWithMetadataInBucket(bucketName);

    expect(mockBucket).toHaveBeenCalledWith(bucketName);
    expect(result).toEqual([
      { name: "file1.csv", updated: "2024-01-15T14:41:29.000Z" },
      { name: "file2.csv", updated: "2024-03-10T09:00:00.000Z" },
    ]);
  });

  it("getFilesWithMetadataInBucket throws when the updated timestamp is missing", async () => {
    const mockFiles = [{ name: "file1.csv", metadata: { updated: "" } } as unknown as File];

    mockGetFiles.mockResolvedValue([mockFiles]);

    await expect(googleStorage.getFilesWithMetadataInBucket(bucketName)).rejects.toThrow(
      "Missing updated timestamp for file file1.csv",
    );
  });

  it("getFileFromBucket returns buffer of file content", async () => {
    const fileContent = Buffer.from("file content");

    mockDownload.mockResolvedValue([fileContent]);

    const result = await googleStorage.getFileFromBucket(bucketName, fileName);

    expect(mockBucket).toHaveBeenCalledWith(bucketName);
    expect(mockFile).toHaveBeenCalledWith(fileName);
    expect(result).toEqual(fileContent);
  });
});
