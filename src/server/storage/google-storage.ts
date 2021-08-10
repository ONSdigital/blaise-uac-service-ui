import {getEnvironmentVariables} from "../config";
import Cloud, {Storage, StorageOptions} from "@google-cloud/storage";
import path from "path";

export function CreateStorage():Cloud.Storage {
  const {PROJECT_ID} = getEnvironmentVariables();

let googleStorageConfig = <StorageOptions>{
    projectId: PROJECT_ID,
};

if (process.env.NODE_ENV !== "production") {
    console.log("Not Prod: Attempting to use local keys.json file");
    const serviceKey = path.join(__dirname, "/../../keys.json");
    googleStorageConfig = <StorageOptions>{
        projectId: PROJECT_ID,
        keyFilename: serviceKey,
    };
}
return new Storage(googleStorageConfig);
}

