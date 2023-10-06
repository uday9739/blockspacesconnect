
import { UserProfileDto, UserRegistrationDto } from "@blockspaces/shared/dtos/users";
import { AppSettings } from "@blockspaces/shared/models/app-settings";
import { NetworkPriceBillingCodes } from "@blockspaces/shared/models/network-catalog";
import { localStorageHelper } from "@src/platform/utils";
import { extractExpiryDateFromJwy, TOKEN_EXPIRY_KEY } from "@src/platform/utils/user";
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/router";
import { UrlObject } from "url";
import { TenantDto } from "@blockspaces/shared/dtos/tenants";
import * as api from "../../../api/user"
import { userQueryKeys } from "../queries";



export const useDoInitialLogin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    useErrorBoundary: false,
    mutationFn: (args: { username: string, password: string }) => api.initialLogin(args.username, args.password),
    onSuccess: async (doInitialLoginResult, context) => {
      const loginStep = doInitialLoginResult.twoFactorSetupComplete ? `2fa-entry` : `2fa-setup`;
      const state = { loginStep: loginStep, defaultState: { result: doInitialLoginResult, credentials: { email: context.username, password: context.password } } }
      queryClient.setQueryData([`login-state`], state);
      return;
    }
  });
}

export const useGetLoginState = (): { defaultState?: any; loginStep?: string } => {
  const queryClient = useQueryClient();
  return queryClient.getQueryData([`login-state`]);
}

export const useLoginTwoFactor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['login2fa'],
    useErrorBoundary: false,
    mutationFn: (args: { email: string, password: string, twoFactorCode: string }) => api.login2fa(args.email, args.password, args.twoFactorCode),
    onSuccess(data, variables, context) {
      const user = data.userDetails;
      const accessToken = user.accessToken;
      const expiryDate = extractExpiryDateFromJwy(accessToken);
      localStorageHelper.setItem(TOKEN_EXPIRY_KEY, expiryDate?.toString());
      queryClient.setQueryData([userQueryKeys.currentUser], user, {});
      queryClient.setQueryData([`login-state`], null);
    },
  });
}
export const useAuthRedirect = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (args: { url: UrlObject }) => {
      queryClient.setQueryData([userQueryKeys.authRedirect], args.url, {});
    },
  });
}

export const useRegisterUser = () => {
  return useMutation({
    mutationFn: (args: UserRegistrationDto) => api.register(args)
  });
}

export const useQuickRegisterUser = () => {
  return useMutation({
    mutationFn: (args: UserRegistrationDto) => api.quickRegister(args)
  });
}

export const useConfigure2fa = () => {
  return useMutation({
    mutationFn: (args: { username: string, password: string }) => api.configure2fa(args.username, args.password)
  });
}

export const useVerifyEmail = () => {
  return useMutation({
    mutationFn: (args: { email: string }) => api.verifyEmail(args.email)
  });
}

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (args: { email: string }) => api.forgotPassword(args.email)
  });
}

export const useGetForgotPasswordConfirmResult = () => {
  return useMutation(['ForgotPasswordConfirmResult'], (args: { token: string }) => api.getForgotPasswordConfirmResult(args.token), { useErrorBoundary: false });
}

export const useResetPassword = () => {
  return useMutation({
    mutationFn: (args: { password: string, context: string }) => api.resetPassword(args.password, args.context),
    useErrorBoundary: false
  });
}

// redirects to destination after login
export const useLogout = () => {
  const router = useRouter();
  return useMutation({
    mutationFn: () => api.logout(),
    onMutate: () => { },
    onSuccess: async (data, variables, context) => {
      localStorageHelper.removeItem(TOKEN_EXPIRY_KEY);
      // queryClient.setQueryData([userQueryKeys.authRedirect], path, {});
      await router.push('auth');
    },
  });
}

export const useRevokeToken = () => {
  return useMutation({
    mutationFn: () => api.revokeToken()
  })
}

export const useAcceptToS = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.acceptTos(),
    onSuccess: async (data, variables, context) => {
      await queryClient.invalidateQueries([userQueryKeys.currentUser], {})
    }
  });
}

export const useSetWelcomeFlag = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.setWelcomeFlag(),
    onSuccess: async (data, variables, context) => {
      await queryClient.invalidateQueries([userQueryKeys.currentUser], {})
    }
  });
}

export const useAddUserNetwork = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (args: { networkId: string, billingTierCode: string, billingCategoryCode: string }) => api.addUserNetwork(args.networkId, args.billingTierCode, args.billingCategoryCode),
    onSuccess: async (data, variables, context) => {
      await queryClient.invalidateQueries([userQueryKeys.currentUser], {})
      await queryClient.invalidateQueries([userQueryKeys.userNetworks], {})
    }
  });
}

export const useCancelSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (args: { networkId: string, billingCategoryCode: NetworkPriceBillingCodes, billingTierCode: string }) => api.cancelSubscription(args.networkId, args.billingCategoryCode, args.billingTierCode),
    onSuccess: async (data, variables, context) => {
      await queryClient.invalidateQueries([userQueryKeys.currentUser], {})
      await queryClient.invalidateQueries([userQueryKeys.connectSubscription], {})
      await queryClient.invalidateQueries([userQueryKeys.userNetworks], {})
    }
  });
}

export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (args: UserProfileDto) => api.updateUserProfile(args),
    onSuccess: async (data, variables, context) => {
      await queryClient.invalidateQueries([userQueryKeys.userProfile], {})
    }
  });
}

export const useUpdateUserAppSettings = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (args: AppSettings) => api.updateUserAppSettings(args),
    onSuccess: async () => {
      await queryClient.invalidateQueries([userQueryKeys.currentUser], {})
    }
  })
}


export const useVerifyEmailWithToken = () => {
  return useMutation({
    mutationFn: (args: { token: string, userId: string }) => api.verifyEmailWithToken(args.userId, args.token),
    onSuccess: async () => {

    },
    onError: () => {
      console.log("onError");
    }
  })
}
