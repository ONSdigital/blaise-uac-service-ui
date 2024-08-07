# Blaise UAC Service (BUS) UI

Web-based UI for [BUS](https://github.com/ONSdigital/blaise-uac-service)!

The UI allows questionnaire sample CSVs to be uploaded and stored in a storage bucket, it then sends the questionnaire name provided and the serial numbers of the cases from the sample CSV to BUS so UACs can be generated. The UACs are then appended to the sample CSV file in the bucket. The UI then provides a link for the user to download their orignal sample CSV but now with UACs!

This UI also allows to disable or enable a UAC.

This project is a React.js application which when built is rendered by a Node.js express server.

The application is being deployed to Google App Engine.

### Local Setup 

Prerequisites:

Prerequisites:
- [Node.js version 20](https://nodejs.org/)
- [Yarn](https://yarnpkg.com/)
- [Cloud SDK](https://cloud.google.com/sdk/)

Clone the repository:

```shell script
git clone https://github.com/ONSdigital/blaise-uac-service-ui.git
```

Create an .env file in the root of the project and add the following variables:

| Variable | Description | Example |
| --- | --- | --- |
| BUCKET_NAME | GCP bucket name for the sample file to be stored. | ons-blaise-v2-dev-sandbox123-bus |
| BUS_API_URL | The BUS API URL the application will use to generate UACs. | ons-blaise-v2-dev-sandbox123-bus  |
| BUS_CLIENT_ID | The client ID the application will use to authenticate with BUS. | blah.apps.googleusercontent.com |
| BLAISE_API_URL | The Blaise API URL the application will use to check the users role has permission to use this service. | http://localhost:90 |
| SERVER_PARK | Server park name to fetch all the installed questionnaires and then use those questionnaire names to get all the disabled code for each one of then to display them to the user. | gusty |

Example .env file:

```.env
PROJECT_ID=ons-blaise-v2-dev-sandbox123
BUCKET_NAME=ons-blaise-v2-dev-sandbox123-bus
BUS_API_URL=https://dev-sandbox123-bus.social-surveys.gcp.onsdigital.uk
BUS_CLIENT_ID=blah.apps.googleusercontent.com
BLAISE_API_URL=http://localhost:90
SERVER_PARK=gusty
```

Install the project dependencies:

```shell script
yarn install
```

Running yarn or yarn install will install the required modules specified in the yarn.lock file.

The versions of theses modules are fixed in the yarn.lock files, so to avoid unwanted upgrades or instability caused by incorrect modifications, DO NOT DELETE THE LOCK FILE.

More information about yarn (https://confluence.ons.gov.uk/x/zdwACQ)

Authenticate with GCP:
```shell
gcloud auth login
```

Set your GCP project:
```shell
gcloud config set project ons-blaise-v2-dev-sandbox123
```

Open a tunnel to the Blaise API in your GCP project:
```shell
gcloud compute start-iap-tunnel restapi-1 80 --local-host-port=localhost:90 --zone europe-west2-a
```

Download a service account JSON key for accessing the bucket in your GCP project:

```
gcloud iam service-accounts keys create keys.json --iam-account ons-blaise-v2-dev-<sandbox>@appspot.gserviceaccount.com
```

Temporary set your local GOOGLE_APPLICATION_CREDENTIALS environment variable to this JSON file:

```
Unix: export GOOGLE_APPLICATION_CREDENTIALS=keys.json
Windows: set GOOGLE_APPLICATION_CREDENTIALS=keys.json
```

Run Node.js server and React.js client via the following package.json script:

```shell script
yarn dev
```

The UI should now be accessible via:

http://localhost:3000/

**NB: Port 5000  may already be in use on a Mac, to release it go to System Preferences -> Sharing -> AirPlay Receiver and uncheck it**

Tests can be run via the following package.json script:

```shell script
yarn test
```

Test snapshots can be updated via:

```shell script
yarn test -u
```

To deploy your locally edited version of the application to App Engine within your sandbox, create an `app.yaml` file based off the template provided in this repository, you'll need to manually set the environment variables, then run `gcloud app deploy`.