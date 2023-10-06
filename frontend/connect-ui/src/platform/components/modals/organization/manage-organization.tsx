import { UserProfileDto } from "@blockspaces/shared/dtos/users";
import router, { useRouter } from "next/router";
import { useEffect, useMemo } from "react";
import { FormState } from "react-hook-form";
import DeleteIcon from "@mui/icons-material/Delete";
import { useGetCurrentUser, useGetTenantMembers, useUserHasRole } from "@src/platform/hooks/user/queries";
import { useUpdateUserProfile } from "@src/platform/hooks/user/mutations";
import { useUIStore } from "@src/providers";
import { ColumnLabel, Header, ModalContainer, Row, RowText, StyledOrgTable, TitleContainer } from "../styles/organization-styes";
import { TenantDto, TenantMemberDto, TenantMemberProfileDto, TenantRole } from "@blockspaces/shared/dtos/tenants";
import { ModalContent } from "../../common/modal/modal-content";
import { Box, Button } from "@mui/material";
import { Button as AppButton } from "@platform/common";
import { useGetUsersTenants } from "@src/platform/hooks/tenant/queries";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { TenantMemberStatus } from "@blockspaces/shared/models/tenants";

export type OrganizationTableProps = {
  isSubmitting: boolean;
  formState: FormState<UserProfileDto>;
};

export const getUserProfileFormContent = ({ isSubmitting, formState }: OrganizationTableProps) => {
  return (
    <>
      <AppButton id="btnSveUserProfile" type="submit" label="SAVE CHANGES" width="28rem" labelOnSubmit="SAVING CHANGES" submitting={isSubmitting || formState.isSubmitting} />
    </>
  );
};
const hasRole = useUserHasRole();

const gridColumns: GridColDef[] = [
  {
    field: "memberUserId",
    hide: true
  },
  {
    field: "memberProfile",
    headerName: "Name",
    editable: false,
    flex: 1,
    renderCell: (params) => (
      <>
        {params.row.memberProfile?.firstName} {params.row.memberProfile?.lastName}
      </>
    )
  },
  {
    field: "*",
    headerName: "Email",
    editable: false,
    flex: 1,
    renderCell: (params) => <>{params.row.memberProfile?.email}</>
  },
  {
    field: "memberStatus",
    headerName: "Status",
    editable: false,
    flex: 1
  },
  {
    field: "isOwner",
    headerName: "Actions",
    editable: false,
    renderCell: (params) => (
      !params.row.isOwner && hasRole(params.row.ownerId, TenantRole.TENANT_USER_ADMIN) &&

      <Box sx={{}}>
        <Button
          size="small"
          id=" Edit-Permissions"
          variant="contained"
          sx={{}}
          onClick={() => router.push({ pathname: router.pathname, query: { modal: "user-organization-permissions", userId: params.row?.memberUserId, tenantId: params.row?.tenantId } })}
        >
          Edit Permissions
        </Button>
        {params.row.isOwner === false ? (
          <Button id="Remove" size="small" variant="outlined" startIcon={<DeleteIcon />}>
            Remove
          </Button>
        ) : (
          <></>
        )}
      </Box>
    ),
    flex: 1
  }
];

type Props = {
  tenantId: string;
};

export const ManageOrganization = () => {
  const router = useRouter();
  const uiStore = useUIStore();
  const { mutate: updateUserProfile, isLoading: isSubmitting, isError, isSuccess: updateUserProfileIsSuccess } = useUpdateUserProfile();
  const { data: user } = useGetCurrentUser();
  const tenant = TenantDto.fromTenant(user?.activeTenant);
  const returnQuery = { ...router.query };
  delete returnQuery.modal;
  const { data: userTenants, isLoading: isUserTenantsLoading } = useGetUsersTenants();

  useEffect(() => {
    if (isSubmitting) return;
    if (updateUserProfileIsSuccess) {
      uiStore.showToast({
        message: "Profile Updated",
        alertType: "success",
        position: {
          horizontal: "right",
          vertical: "top"
        }
      });
      router.push({
        pathname: router.pathname,
        query: returnQuery
      });
    }
  }, [isSubmitting, updateUserProfileIsSuccess]);

  const isOwner = (userId) => {
    return tenant.ownerId === userId;
  };

  const getGridData = (ownerId:string, tenantId:string): Array<{
    isOwner: boolean;
    memberUserId?: string;
    memberProfile: TenantMemberProfileDto;
    memberStatus: TenantMemberStatus;
    ownerId: string;
    tenantId: string;
  }> => {
    const members = userTenants
      ?.find((x) => x.tenantId === tenant?.tenantId)
      ?.members?.map((member, i) => {
        return {
          ...member,
          isOwner: isOwner(member.memberUserId),
          ownerId: ownerId,
          tenantId: tenantId,
        };
      });
    return members || [];
  };

  const Owner = useMemo(() => {
    const currentTenant = userTenants?.find((x) => x.tenantId === tenant.tenantId);
    const owner = currentTenant?.members?.find((x) => x.memberUserId === currentTenant.ownerId);
    return owner;
  }, [tenant, userTenants]);

  return (
    <>
      <ModalContent size="medium" title={`Manage ${tenant?.name} Members`} secondaryBtnText={`Close`} hidePrimaryAction={true} isLoading={false} isSubmitting={false}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "",
            justifyContent: "space-between"
          }}
        >
          <Box>
            <b> Organization Owner :</b>
            <span>
              {"   "}
              {Owner?.memberProfile?.firstName}
              {Owner?.memberProfile?.lastName}
            </span>
            <small> ({Owner?.memberProfile?.email})</small>
          </Box>
          <Button
            variant="contained"
            onClick={() => {
              router.push({ pathname: router.pathname, query: { modal: "invite-user", tenantId: tenant?.tenantId } });
            }}
          >
            Invite Member
          </Button>
        </Box>
        <Box sx={{ marginTop: "10px" }}>
          <DataGrid rows={getGridData(user.id, user.activeTenant?.tenantId)} autoHeight getRowId={(row: any) => row.memberUserId} columns={gridColumns} disableSelectionOnClick />
        </Box>
      </ModalContent>
    </>
  );
};
