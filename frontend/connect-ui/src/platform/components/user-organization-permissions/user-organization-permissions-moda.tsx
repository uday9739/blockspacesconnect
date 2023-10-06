import { ModalContent } from "@src/platform/components/common/modal/modal-content";
import { useRouter } from "next/router";
import { ChangeEvent, useEffect, useState } from "react";
import { Alert, Box, FormControl, FormControlLabel, FormGroup, Switch } from "@mui/material";
import { useUIStore } from "@src/providers";
import { useAcceptInvite, useCreateTenant, useGetTenant, useUpdateTenantMemberPermissions } from "@src/platform/hooks/tenant/mutations";
import { useGetCurrentUser, useUserHasRole } from "@src/platform/hooks/user/queries";
import { classValidatorResolver } from "@hookform/resolvers/class-validator";
import { Title, TextInput, Button, Select, IOption, PhoneInputSelect, Loading } from "@platform/common";
import { TenantDto, TenantRole } from "@blockspaces/shared/dtos/tenants";
import { Control, FormState, SubmitHandler, useForm, UseFormGetValues, UseFormRegister, UseFormSetValue } from "react-hook-form";
import { getTenantMemberPermissions } from "@src/platform/api/tenant";
import { useGetTenantMemberPermissions } from "@src/platform/hooks/tenant/queries";
import styled, { useTheme } from "styled-components";
const getUserId = (router): string => {
  return router.query?.userId;
};
const getTenantId = (router): string => {
  return router.query?.tenantId;
}

export type UserOrganizationPermissionsProps = {};
export const UserOrganizationPermissions = ({}: UserOrganizationPermissionsProps) => {
  const ui = useUIStore();
  const theme = useTheme();
  const router = useRouter();
  const user = useGetCurrentUser();
  const hasRole = useUserHasRole();
  const { data: memberPermissions, error: getTenantMemberPermissionsError, isLoading, refetch } = useGetTenantMemberPermissions(getTenantId(router), router.query?.userId?.toString());
  const { mutate: updateTenanteMemberPermissions} = useUpdateTenantMemberPermissions(getTenantId(router),router.query?.userId?.toString())
  const tenantRolesList = Object.values(TenantRole).filter((x) => x !== TenantRole.TENANT_USER);
  // handle init
  useEffect(() => {
    if (!user?.data || !router.isReady) return;
    const userId = getUserId(router);
    if (!userId) {
      ui.showToast({
        message: "Missing userId",
        alertType: "error",
        autoHideDuration: 5000,
        position: {
          horizontal: "right",
          vertical: "top"
        }
      });
    } else {
      //
    }
  }, [user, router]);

  const getRoleName = (key) => {
    switch (key) {
      case TenantRole.TENANT_USER:
        break;
      case TenantRole.TENANT_USER_ADMIN:
        return `User Admin`;

      case TenantRole.BILLING_ADMIN:
        return `Billing Admin`;
      case TenantRole.SUBSCRIBE_TO_SERVICES:
        return `Subscribe to Services`;

      default:
        return "";
    }
  };

  const setPermission = (item, enabled) => {
    updateTenanteMemberPermissions({tenantId: getTenantId(router), role:item, enabled:enabled})
  }

  const _onPrimaryClick = (data) => {};

  return (
    <ModalContent
      size="small"
      title={`Edit Permissions`}
      primaryBtnText="Save"
      secondaryBtnText={`Close`}
      hidePrimaryAction={true}
      onPrimaryActionClick={() => {}}
      isLoading={false}
      isSubmitting={false}
    >
      {getTenantMemberPermissionsError ? (
        <Alert severity="error" color="error">
          {(getTenantMemberPermissionsError as any)?.message}
        </Alert>
      ) : (
        <>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "15px"
            }}
          >
          <Loading when={isLoading} />
            <h3>
              {memberPermissions?.user?.fullName} <small> ({memberPermissions?.user?.email})</small>
            </h3>
          </Box>
          
          {tenantRolesList.map((x) => {
            return (
              <Box
                sx={{
                  width: "350px",
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "15px",
                  paddingBottom: "7px",
                  borderBottom: "1px solid",
                  borderBottomColor: theme.palette.grey[300]
                }}
              >
                <Box>{getRoleName(x)}</Box>
                <FormControl component="fieldset" variant="standard">
                  <FormGroup>
                    <FormControlLabel
                      control={<Switch size="small" id={`${x}-role-switch`} checked={hasRole(memberPermissions?.userId,x)} onChange={(event: ChangeEvent<HTMLInputElement>) => setPermission(event.target.value, event.target.checked)} />}
                      label=""
                      value={x}
                    />
                  </FormGroup>
                </FormControl>
              </Box>
            );
          })}
        </>
      )}
    </ModalContent>
  );
};
