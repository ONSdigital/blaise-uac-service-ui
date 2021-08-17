import {CreateStorage} from "./google-storage";

export async function uploadFileToBucket(bucketName: string, file: Express.Multer.File, fileName: string) {
    const storage = CreateStorage();
    const bucket = storage.bucket(bucketName);
    const uploadFile = bucket.file(fileName);

    await uploadFile.save(Buffer.from(file));
}

export async function fileExistsInBucket(bucketName: string, fileName: string): Promise<boolean> {
    const storage = CreateStorage();
    const bucket = storage.bucket(bucketName);

    return (await bucket.file(fileName).exists())[0];
}