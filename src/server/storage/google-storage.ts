import {Storage} from "@google-cloud/storage";

export async function uploadFileToBucket(bucketName: string, sourceFilePath: string, destinationFilePath: string) {
    const storage = new Storage();
    const bucket = storage.bucket(bucketName);
    const uploadOptions = {destination: destinationFilePath};

    console.log(`attempt to upload file ${destinationFilePath}`);
    await bucket.upload(sourceFilePath, uploadOptions);
    console.log(`Uploaded file${destinationFilePath}`);
}
