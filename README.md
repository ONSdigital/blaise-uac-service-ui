# Blaise UAC generation service

Service for uploading sample files to and generating unique UAC codes.

This is done by uploading the sample file to a GCP Bucket then sending a request to
the [Blaise UAC Service](https://github.com/ONSdigital/blaise-uac-service) to generate UACS for all cases.  
The sample file containing the generated UAC codes can be downloaded by the user.

This project is a React application which when build is rendered by a Node.js express server. The Node.js handles the
file being uploaded from the client and uploads the file a GCP bucket using
the [@google-cloud/storage module](https://www.npmjs.com/package/@google-cloud/storage).

### Setup

#### Prerequisites

To run Blaise UAC generation service locally, you'll need to have [Node installed](https://nodejs.org/en/), as well
as [yarn](https://classic.yarnpkg.com/en/docs/install#mac-stable).

#### Setup locally steps

Clone the Repo

```shell script
git clone https://github.com/ONSdigital/blaise-uac-service-ui.git
```

Create a new .env file and add the following variables.

| Variable                      | Description                                                                     | Var Example                  |
|-------------------------------|---------------------------------------------------------------------------------|------------------------------|
| PROJECT_ID                    | GCP Project ID                                                                  | ons-blaise-dev-jam-04        |
| BUCKET_NAME                   | GCP Bucket name for the sample file to be stored                                | ons-blaise-dev-jam-04-bus    |
| BUS_API_URL                   | Url that the [BUS Service](https://github.com/ONSdigital/blaise-uac-service) is running on to send calls to set and get the live date.  | localhost:5011 |
| BUS_CLIENT_ID                | GCP IAP ID for the [BUS Service](https://github.com/ONSdigital/blaise-uac-service)  | randomKey0112 |

The .env file should be setup as below

```.env
PROJECT_ID='ons-blaise-dev-jam-04'             
BUCKET_NAME='ons-blaise-dev-jam-04-bus'
BUS_API_URL=localhost:5011
BUS_CLIENT_ID=randomKey0778
```

Install required modules

```shell script
yarn
```

##### Local access to GCP Bucket

To get the service working locally with a remote GCP Bucket, you need
to execute the following commands to obtain service account keys and gain access:

```
gcloud auth login
```

```
gcloud iam service-accounts keys create keys.json --iam-account ons-blaise-v2-dev-<sandbox>@appspot.gserviceaccount.com
```

```
export GOOGLE_APPLICATION_CREDENTIALS=keys.json
```

##### Run commands

The following run commands are available, these are all setup in the `package.json` under `scripts`.

| Command                | Description                                                                                                                                               |
|------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------|
| `yarn dev`            |  starts the react project and runs the express server. Any existing processes will be stopped               |
| `yarn client`          | Starts react project in local development setup with quick reloading on making changes. Note: For instruments to be shown the server needs to be running. |
| `yarn server`          | Complies Typescript and starts the express server, Note: For the website to be rendered the React Project will need to be built.                          |
| `yarn build-react`     | Compiles build project ready to be served by express. The build is outputted to the the `build` directory which express points to with the var `buildFolder` in `server/server.js`.                       |
| `yarn test`            | Runs all tests for server and React Components and outputs coverage statistics.                                                                           |
| `yarn start`           | Used by App Engine to start the server |
| `gcp-build`            | Used to build the React app and compile the server for App Engine                                                                               |

##### Simple setup for local development

Make sure the React project make requests the express server make sure the proxy option is set to the right port
in the 'package.json'

```.json
"proxy": "http://localhost:5000",
```

Run the project for local development. By default, this will be running on PORT 3000

```shell script
yarn dev
```

### Tests

The [Jest testing framework](https://jestjs.io/en/) has been setup in this project, all tests currently reside in
the `tests` directory. This currently only running tests on the health check endpoint, haven't got the hang of mocking
Axios yet.

To run all tests run

```shell script
yarn test
```

Other test command can be seen in the Run Commands section above.

Deploying to app engine

To deploy the locally edited service to app engine in your environment, you need to create a local
'app.yaml' file:

```.shell
service: bus-ui
runtime: nodejs14
vpc_access_connector:
  name: 
env_variables:
    PROJECT_ID: 
    BUCKET_NAME: 
    BUS_API_URL: 
    BUS_CLIENT_ID: 
basic_scaling:
    idle_timeout: 10m
    max_instances: 5
handlers:
- url: /.*
  script: auto
  secure: always
  redirect_http_response_code: 301
```

you can then run the following command to deploy the app to app engine: 

```.shell
gcloud app deploy
```

Copyright (c) 2021 Crown Copyright (Government Digital Service)