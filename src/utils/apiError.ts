import axios, { AxiosError } from "axios";

export class ApiErrorHandler {
  static parse(error: unknown): string {
    if (axios.isAxiosError(error)) {
      const axiosErr = error as AxiosError;

      const data = axiosErr.response?.data as any;

      const message =
        data?.message ||
        data?.error ||
        axiosErr.response?.statusText ||
        axiosErr.message;

      return `${message}`;
    }

    if (error instanceof Error) {
      return `Error: ${error.message}`;
    }

    return "An unexpected error occurred.";
  }
}
