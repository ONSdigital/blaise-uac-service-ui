import {UploadResponse, Storage} from "@google-cloud/storage";

export async function upload_file(instrumentName: string | undefined, file: File | undefined) {
    console.log("Uploading....")
    console.log('instrumentName:' + instrumentName);
    console.log('file:' + file);
    const bucketName = 'ons-blaise-v2-dev-dqs';
    const fs = require('fs');
    //fs.writeFile("d:\\testfile.csv", file);

    /*
    const filePath = 'd:\\testfile.csv';
    const storage = new Storage({
        projectId: 'ons-blaise-v2-dev',
        keyFilename: 'd:\\dev-storage-key.json'
    });
    const bucket = storage.bucket(bucketName);
    console.log('attempt to upload file');
    bucket.upload(filePath).then(function (data: UploadResponse) {
        const file = data[0];
    });
    */
    console.log("Uploaded!")
}