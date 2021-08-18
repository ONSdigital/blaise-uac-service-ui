module.exports = {
    "moduleNameMapper": {
        "\\.(css|less|scss)$": "identity-obj-proxy"
    }
};

process.env = Object.assign(process.env, {
    PROJECT_ID: "a-project-name",
    BUCKET_NAME: "unique-bucket",
    BUS_API_URL: "bus-api-url",
    BUS_CLIENT_ID: "bus-client-id",
});
