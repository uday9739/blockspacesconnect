

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiService from "../utils/apiService";
import localStorageHelper from "src/platform/utils/local-storage";

export const userStateKeys = {
  currentUser: `currentUser`,
}

export const useAuthenticateWithGoogleCreds = () => {
  return useMutation({
    mutationFn: (args: { token: string | undefined }) => apiService.post("auth/login", args),
    onSuccess: async (data, variables, context) => {
      console.log('data', data)
      const token = data.data.token;
      localStorageHelper.setItem('access_token', token);
    }
  });
}

export const useGetCurrentUser = () => {
  return useQuery([userStateKeys.currentUser], () => apiService.get("auth/current"), {
    // user data doesn't change that often
    // if you perform an actions that needs to refresh user mark as stale
    staleTime: 60 * 1000,
  });
}