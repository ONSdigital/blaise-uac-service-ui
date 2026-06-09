import { type Bucket, type File, Storage } from "@google-cloud/storage";

export class SampleFileExistsError extends Error {
  constructor(fileName: string) {
    super(`Sample file ${fileName} already exists`);
    this.name = "SampleFileExistsError";
  }
}

function isStorageConflictError(error: unknown): error is { code: number } {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    ((error as { code?: unknown }).code === 409 || (error as { code?: unknown }).code === 412)
  );
}

function readUpdatedMetadata(file: File): string {
  const updated = file.metadata.updated;

  if (typeof updated !== "string" || updated.trim() === "") {
    throw new Error(`Missing updated timestamp for file ${file.name}`);
  }

  return updated;
}

export class GoogleStorage {
  private readonly storage: Storage;

  constructor(projectId: string) {
    this.storage = new Storage({ projectId });
  }

  private bucket(bucketName: string): Bucket {
    return this.storage.bucket(bucketName);
  }

  async uploadFileToBucket(
    bucketName: string,
    file: Express.Multer.File,
    fileName: string,
    overwrite = true,
  ): Promise<void> {
    try {
      if (overwrite) {
        await this.bucket(bucketName).file(fileName).save(Buffer.from(file.buffer));
      } else {
        await this.bucket(bucketName)
          .file(fileName)
          .save(Buffer.from(file.buffer), {
            preconditionOpts: { ifGenerationMatch: 0 },
          });
      }
    } catch (error) {
      if (!overwrite && isStorageConflictError(error)) {
        throw new SampleFileExistsError(fileName);
      }

      throw error;
    }
  }

  async fileExistsInBucket(bucketName: string, fileName: string): Promise<boolean> {
    return (await this.bucket(bucketName).file(fileName).exists())[0];
  }

  async getFileNamesInBucket(bucketName: string): Promise<string[]> {
    const [files] = await this.bucket(bucketName).getFiles();

    return files.map((file) => file.name);
  }

  async getFilesWithMetadataInBucket(
    bucketName: string,
  ): Promise<{ name: string; updated: string }[]> {
    const [files] = await this.bucket(bucketName).getFiles();

    return files.map((file) => ({ name: file.name, updated: readUpdatedMetadata(file) }));
  }

  async getFileFromBucket(bucketName: string, fileName: string): Promise<Buffer> {
    return (await this.bucket(bucketName).file(fileName).download())[0];
  }
}
