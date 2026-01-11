service: bus-ui
runtime: nodejs20

vpc_access_connector:
  name: _VPC_CONNECTOR

env_variables:
  PROJECT_ID: _PROJECT_ID
  BUCKET_NAME: _BUCKET_NAME
  SERVER_PARK: _SERVER_PARK
  BUS_API_URL: _BUS_API_URL
  BUS_CLIENT_ID: _BUS_CLIENT_ID
  BLAISE_API_URL: _BLAISE_API_URL
  SESSION_TIMEOUT: _SESSION_TIMEOUT
  SESSION_SECRET: _SESSION_SECRET
  ROLES: _ROLES

automatic_scaling:
  min_instances: _MIN_INSTANCES
  max_instances: _MAX_INSTANCES
  target_cpu_utilization: _TARGET_CPU_UTILIZATION

handlers:
- url: /.*
  script: auto
  secure: always
  redirect_http_response_code: 301
