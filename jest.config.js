module.exports = {
  moduleNameMapper: {
    "\\.(css|less|scss)$": "identity-obj-proxy",
  },
};

process.env = Object.assign(process.env, {
  PROJECT_ID: "ProjectID-mock",
  BUCKET_NAME: "BucketName-mock",
  BUS_API_URL: "BusApiUrl-mock",
  BUS_CLIENT_ID: "BusClientId-mock",
  BLAISE_API_URL: "BlaiseApiUrl-mock",
  ROLES: ["MockRole1", "MockRole2", "MockRole3"],
  SESSION_TIMEOUT: "SessionTimeout-mock",
  SESSION_SECRET: "SessionSecret-mock",
});
