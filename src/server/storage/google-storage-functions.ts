import {CreateStorage} from "./google-storage";

export async function uploadFileToBucket(bucketName: string, file: Express.Multer.File, fileName: string) {
    const bucket = getBucket(bucketName);
    const uploadFile = bucket.file(fileName);

    await uploadFile.save(Buffer.from(file.buffer));
}

export async function fileExistsInBucket(bucketName: string, fileName: string): Promise<boolean> {
    const bucket = getBucket(bucketName);

    return (await bucket.file(fileName).exists())[0];
}

export async function getFilenamesInBucket(bucketName: string): Promise<string[]> {
    const bucket = getBucket(bucketName);
    const [files] = await bucket.getFiles();
    const fileNames: Array<string> = [];

    files.forEach(file => {
        fileNames.push(file.name);
    });

    return fileNames;
}

function getBucket(bucketName: string) {
    const storage = CreateStorage();
    return storage.bucket(bucketName);
}
