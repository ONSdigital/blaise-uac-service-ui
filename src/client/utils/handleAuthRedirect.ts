import { isAxiosError } from "axios";

export default function handleAuthRedirect(error: unknown): boolean {
  if (isAxiosError(error) && (error.response?.status === 401 || error.response?.status === 403)) {
    window.location.assign("/");

    return true;
  }

  return false;
}
