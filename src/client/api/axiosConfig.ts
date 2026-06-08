import { AuthManager } from "blaise-login-react-client";

import { getSharedAuthOptions } from "../utils/auth";

import type { AxiosRequestConfig } from "axios";

const authManager = new AuthManager(getSharedAuthOptions());

export default function axiosConfig(): AxiosRequestConfig {
  return {
    headers: authManager.authHeader(),
  };
}
