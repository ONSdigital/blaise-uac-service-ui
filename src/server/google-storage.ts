import {UploadResponse, Storage} from "@google-cloud/storage";

export async function upload_file(instrumentName: string, filePath: string) {
    const bucketName = 'ons-blaise-v2-dev-dqs';
    const storage = new Storage({
        projectId: 'ons-blaise-v2-dev',
        keyFilename: 'd:\\dev-storage-key.json'
    });
    const bucket = storage.bucket(bucketName);
    const uploadOptions = {
        destination: `${instrumentName}.csv`,
    };
    console.log('attempt to upload file');

    bucket.upload(filePath, uploadOptions).then(function (data: UploadResponse) {

    });

    console.log("Uploaded!")
}

export async function upload_file2(instrumentName: string, file: File) {
    console.log("Uploading....")
    console.log('instrumentName:' + instrumentName);
    console.log('file:' + file);
    const bucketName = 'ons-blaise-v2-dev-dqs';
    const storage = new Storage({
        projectId: 'ons-blaise-v2-dev',
        keyFilename: 'd:\\dev-storage-key.json'
    });
    const bucket = storage.bucket(bucketName)
    const uploadFile = bucket.file('test-upload.csv');

    const fs = require('fs');

    fs.createReadStream(file?.stream())
        .pipe(uploadFile.createWriteStream({gzip: true}))
        .on('error', function (err: Error) {
        })
        .on('finish', function () {
            console.log("Uploading....")
        });

    console.log("Uploaded!")
}