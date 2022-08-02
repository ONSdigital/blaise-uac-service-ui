import Cloud, { Storage, StorageOptions } from "@google-cloud/storage";
import path from "path";

export function CreateStorageClient(projectID: string): Cloud.Storage {
    console.log("project id:", projectID);

    const googleStorageConfig = <StorageOptions>{
        projectId: projectID,
    };

    if (process.env.NODE_ENV !== "production") {
        console.log("Not Prod: Attempting to use local keys.json file");
        const serviceKey = path.join(__dirname, "../../keys.json");
        googleStorageConfig.keyFilename = serviceKey;
    }
    return new Storage(googleStorageConfig);
}
