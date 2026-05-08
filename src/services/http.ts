import axios from "axios";
import { redirectToSessionExpiredIfNeeded } from "@/lib/auth/client-session-expiry";
import { markClientSessionActivity } from "@/lib/auth/client-session-activity";

export const http = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "",
});

http.interceptors.response.use(
  (response) => {
    markClientSessionActivity();
    return response;
  },
  async (error) => {
    const status = error?.response?.status;
    if (status && status !== 401) {
      markClientSessionActivity();
    }

    redirectToSessionExpiredIfNeeded(status);

    return Promise.reject(error);
  },
);
