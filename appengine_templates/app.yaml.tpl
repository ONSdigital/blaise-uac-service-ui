service: bus-ui
runtime: nodejs18

vpc_access_connector:
  name: projects/_PROJECT_ID/locations/europe-west2/connectors/vpcconnect

env_variables:
  PROJECT_ID: _PROJECT_ID
  BUCKET_NAME: _BUCKET_NAME
  BUS_API_URL: _BUS_API_URL
  BUS_CLIENT_ID: _BUS_CLIENT_ID
  BLAISE_API_URL: _BLAISE_API_URL
  SESSION_TIMEOUT: _SESSION_TIMEOUT
  SESSION_SECRET: _SESSION_SECRET
  ROLES: _ROLES

basic_scaling:
  idle_timeout: 10m
  max_instances: 5

handlers:
- url: /.*
  script: auto
  secure: always
  redirect_http_response_code: 301
