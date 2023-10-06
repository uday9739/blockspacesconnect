import { ModalContent } from "@src/platform/components/common/modal/modal-content";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Alert, Box, Button, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { useUIStore } from "@src/providers";
import { useAcceptInvite, useCreateTenant, useGetTenant, useSetActiveTenant } from "@src/platform/hooks/tenant/mutations";
import { useGetCurrentUser } from "@src/platform/hooks/user/queries";
import { classValidatorResolver } from "@hookform/resolvers/class-validator";
import { Title, TextInput, IOption, PhoneInputSelect } from "@platform/common";
import { TenantDto } from "@blockspaces/shared/dtos/tenants";
import { Control, FormState, SubmitHandler, useForm, UseFormGetValues, UseFormRegister, UseFormSetValue } from "react-hook-form";
import GroupsIcon from "@mui/icons-material/Groups";
import { useGetUsersTenants } from "@src/platform/hooks/tenant/queries";
import { TenantType } from "@blockspaces/shared/models/tenants";

const getTenantId = (user, router): string => {
  const fallBackTenantId = user && user.tenants ? user?.tenants[0] : null;
  return router.query?.tenantId || user?.activeTenant?.tenantId || fallBackTenantId;
};

export type OrganizationSettingsProps = {
  isCreate?: boolean;
};
export const OrganizationSettings = ({ isCreate = false }: OrganizationSettingsProps) => {
  const router = useRouter();
  const { data: user, isFetching: userIsFetching, isFetched } = useGetCurrentUser();
  const { data: currentTenant, mutate: fetchTenant, isLoading: tenantIsLoading, isError, error } = useGetTenant();
  const { mutate: createTenant, isError: errorCreatingTenant, isLoading: createTenantIsLoading, isSuccess: createdTenantSuccess } = useCreateTenant();
  const [tenant, setTenant] = useState<TenantDto>();
  const ui = useUIStore();
  const { data: userTenants, isLoading: isUserTenantsLoading } = useGetUsersTenants(isCreate === false);
  const { mutate: setActiveTenant, isLoading: settingActiveTenant, isSuccess: setActiveTenantSuccess, mutateAsync } = useSetActiveTenant();
  const { watch, reset, formState, handleSubmit, control, register, getValues, setValue, setError, clearErrors } = useForm<TenantDto>({
    mode: "onTouched",
    resolver: classValidatorResolver(TenantDto),
    values: tenant
  });
  watch();

  // handle init
  useEffect(() => {
    if (!user || !router.isReady || tenantIsLoading || isError) return;

    if (isCreate && !tenant) {
      setTenant({
        ownerId: user.id
      } as TenantDto);
      reset({
        ownerId: user.id
      } as TenantDto);
      return;
    } else if (!isCreate && !currentTenant) {
      const id = getTenantId(user, router);
      if (id) fetchTenant(id);
    } else if (!isCreate && currentTenant && !tenant) {
      setTenant(currentTenant);
      reset(currentTenant);
    }
  }, [user, router, isError, currentTenant,tenant]);

  // handle form Success
  useEffect(() => {
    if (createdTenantSuccess) {
      ui.showToast({
        message: "Organization created successfully",
        alertType: "success",
        autoHideDuration: 5000,
        position: {
          horizontal: "right",
          vertical: "top"
        }
      });
      _onCancel();
      return;
    }
    if (setActiveTenantSuccess && isFetched) {
      const id = getTenantId(user, router);
      if (id) {
        setTenant(null);
        fetchTenant(id);
      }
    }
  }, [createdTenantSuccess, setActiveTenantSuccess, userIsFetching, isFetched]);

  const _onPrimaryClick = (data: TenantDto) => {
    if (isCreate) {
      //
      createTenant(data);
    } else {
      //
    }
  };

  const _onCancel = () => {
    router.push({ pathname: router.pathname });
  };

  return (
    <ModalContent
      size="small"
      title={isCreate ? `Create Organization` : `Organization Settings`}
      primaryBtnText="Save"
      secondaryBtnText={isCreate ? `Dismiss` : `Close`}
      onPrimaryActionClick={handleSubmit(_onPrimaryClick)}
      onCancel={_onCancel}
      isLoading={tenantIsLoading || settingActiveTenant || userIsFetching}
      hidePrimaryAction={!isCreate}
      isSubmitting={createTenantIsLoading || settingActiveTenant}
    >
      {error ? (
        <Alert severity="error" color="error">
          {(error as any)?.message}
        </Alert>
      ) : (
        <></>
      )}
      <>
        <Box sx={{ display: "" }}>
          {isCreate === false && userTenants?.length > 0 && currentTenant?.tenantId != null ? (
            <>
              <FormControl fullWidth>
                <InputLabel id="Organization">Organization</InputLabel>
                <Select
                  labelId="Organization"
                  id="Organization-select"
                  value={currentTenant?.tenantId}
                  label="Organization"
                  disabled={settingActiveTenant}
                  onChange={(event: SelectChangeEvent) => {
                    setActiveTenant({ tenantId: event.target.value as string });
                  }}
                >
                  {userTenants
                    ?.filter((x) => x.tenantType !== TenantType.PERSONAL)
                    .map((x) => (
                      <MenuItem selected={x.tenantId === currentTenant?.tenantId} value={x.tenantId}>
                        {x.name}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </>
          ) : (
            <></>
          )}

          <TextInput
            register={register}
            disabled={!isCreate}
            name="name"
            type="text"
            label="Name"
            value={getValues("name")}
            error={!!formState.errors["name"]}
            errorMessage={formState.errors["name"]?.message || ""}
          />
          <TextInput
            register={register}
            disabled={!isCreate}
            name="description"
            type="text"
            label="Description"
            value={getValues("description")}
            error={!!formState.errors["description"]}
            errorMessage={formState.errors["description"]?.message || ""}
          />
          {isCreate === false ? (
            <>
              <Button
                startIcon={<GroupsIcon />}
                variant="contained"
                onClick={() => {
                  router.push({ pathname: router.pathname, query: { modal: "manage-organization", tenantId: tenant?.tenantId } });
                }}
              >
                Manage Organization Members
              </Button>
            </>
          ) : (
            <></>
          )}
        </Box>
      </>
    </ModalContent>
  );
};
