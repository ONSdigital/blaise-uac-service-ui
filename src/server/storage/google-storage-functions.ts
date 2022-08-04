import { CreateStorageClient } from "./google-storage";
import Cloud from "@google-cloud/storage";

export class GoogleStorage {
    projectID: string
    storageClient: Cloud.Storage

    constructor(projectID: string) {
        this.projectID = projectID;
        this.storageClient = CreateStorageClient(this.projectID);
    }

    bucket(bucketName: string): Cloud.Bucket {
        return this.storageClient.bucket(bucketName);
    }

    async UploadFileToBucket(bucketName: string, file: Express.Multer.File, fileName: string): Promise<void> {
        await this.bucket(bucketName).file(fileName).save(Buffer.from(file.buffer));
    }

    async FileExistsInBucket(bucketName: string, fileName: string): Promise<boolean> {
        return (await this.bucket(bucketName).file(fileName).exists())[0];
    }

    async GetFileNamesInBucket(bucketName: string): Promise<string[]> {
        const [files] = await this.bucket(bucketName).getFiles();
        const fileNames: Array<string> = [];

        files.forEach(file => {
            fileNames.push(file.name);
        });

        return fileNames;
    }

    async GetFileFromBucket(bucketName: string, fileName: string): Promise<Buffer> {
        return (await this.bucket(bucketName).file(fileName).download())[0];
    }
}
