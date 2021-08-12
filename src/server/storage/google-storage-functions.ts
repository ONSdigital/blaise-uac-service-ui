import {CreateStorage} from "./google-storage";

export async function uploadFileToBucket(bucketName: string, sourceFilePath: string, destinationFilePath: string) {
    const storage = CreateStorage();
    const bucket = storage.bucket(bucketName);
    const uploadOptions = {destination: destinationFilePath};

    await bucket.upload(sourceFilePath, uploadOptions);
}

export async function fileExistsInBucket(bucketName: string, fileName: string): Promise<boolean> {
    const storage = CreateStorage();
    const bucket = storage.bucket(bucketName);

    return (await bucket.file(fileName).exists())[0];
}