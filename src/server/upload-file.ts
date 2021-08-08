import axios from "axios";

export async function uploadFile(instrumentName: string, file: File) {

    console.log("uploadFile")
    console.log('define form data');
    const data = new FormData();
    data.append('file', file);
    data.append('instrumentName', instrumentName);

    const config = { headers: {'Content-Type': 'multipart/form-data' }}

    axios.post('/api/v1/upload', data, config)
        .then(function () {
            console.log("File successfully uploaded");
        })
        .catch(function (error) {
            console.error(`File failed to upload ${error}`);
        });
}