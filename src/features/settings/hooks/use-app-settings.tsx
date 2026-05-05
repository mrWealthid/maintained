"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ApiError } from "@/shared/model/model";
import {
  fetchAppSettings,
  saveAppSettings,
} from "../services/app-settings-service";

const APP_SETTINGS_QUERY_KEY = ["app-settings"] as const;

export function useAppSettings() {
  const query = useQuery({
    queryKey: APP_SETTINGS_QUERY_KEY,
    queryFn: fetchAppSettings,
    staleTime: 60 * 1000,
  });

  return {
    data: query.data?.data,
    isLoading: query.isLoading,
    error: query.error,
  };
}

export function useSaveAppSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveAppSettings,
    onSuccess: async (response) => {
      toast.success("Platform settings saved");
      queryClient.setQueryData(APP_SETTINGS_QUERY_KEY, response);
      await queryClient.invalidateQueries({
        queryKey: APP_SETTINGS_QUERY_KEY,
      });
    },
    onError: (err: ApiError) => toast.error(err.message),
  });
}
