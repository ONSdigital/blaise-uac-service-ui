import {CreateStorage} from "./google-storage";

export async function uploadFileToBucket(bucketName: string, sourceFilePath: string, destinationFilePath: string) {
    const storage = CreateStorage();
    const bucket = storage.bucket(bucketName);
    const uploadOptions = {destination: destinationFilePath};

    console.log(`attempt to upload file '${destinationFilePath}' to bucket '${bucketName}'`);
    await bucket.upload(sourceFilePath, uploadOptions);
    console.log(`Uploaded file '${destinationFilePath}' to bucket '${bucketName}'`);
}
