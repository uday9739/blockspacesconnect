import * as React from "react";
import { useRouter } from "next/router";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import { useUIStore } from "@src/providers";
import { useAcceptInvite, useSetActiveTenant, useCreateTenant, useGetTenant } from "@src/platform/hooks/tenant/mutations";
import { useGetCurrentUser } from "@src/platform/hooks/user/queries";
import { Dropdown, Loading } from "../common";
import { TenantDto } from "@blockspaces/shared/dtos/tenants";
import Divider from "@mui/material/Divider";
import CircularProgress from "@mui/material/CircularProgress";
import { useGetUsersTenants } from "@src/platform/hooks/tenant/queries";

export const SelectActiveTenant = () => {
  const router = useRouter();
  const { data: user, isLoading: isUserLoading, isFetching: userIsFetching } = useGetCurrentUser();
  const { data: userTenants, isLoading: isUserTenantsLoading } = useGetUsersTenants();
  const { mutate: setActiveTenant, isLoading: settingActiveTenant, isSuccess: setActiveTenantSuccess, isError, mutateAsync } = useSetActiveTenant();
  const ui = useUIStore();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const open = Boolean(anchorEl);

  React.useEffect(() => {
    if (isUserTenantsLoading || isUserLoading || userIsFetching) return;
    const tenantId = getActiveTenantId();
    const index = userTenants?.findIndex((x) => x.tenantId === tenantId);
    if (index !== selectedIndex) setSelectedIndex(index);
  }, [userTenants, user, isUserTenantsLoading, isUserLoading, userIsFetching]);

  React.useEffect(() => {
    if (setActiveTenantSuccess) {
      ui.showToast({
        message: `Organization set to ${user.activeTenant?.name}`,
        alertType: "success",
        autoHideDuration: 500,
        position: {
          horizontal: "right",
          vertical: "top"
        }
      });
    }
  }, [setActiveTenantSuccess]);

  const handleClickListItem = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuItemClick = (event: React.MouseEvent<HTMLElement>, index: number, tenant: TenantDto) => {
    setAnchorEl(null);

    if (index != null && tenant != null) {
      setSelectedIndex(index);

      setActiveTenant({ tenantId: tenant.tenantId });
    } else {
      router.push({ pathname: router.pathname, query: { ...router.query, modal: "add-organization" } });
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const getActiveTenantId = (): string => {
    const fallBackTenantId = user?.tenants[0];
    return user?.activeTenant?.tenantId || fallBackTenantId;
  };

  const getActiveTenantName = (): string => {
    const fallBackTenantId = user?.tenants[0];
    return user?.activeTenant?.name || userTenants.find((x) => x.tenantId === fallBackTenantId)?.name;
  };

  if (isUserTenantsLoading) return <Loading when />;
  return (
    <div>
      <List
        component="nav"
        sx={{
          paddingBottom: "0",
          "& .MuiListItem-root": {
            paddingBottom: "0",
            paddingTop: "0"
          }
        }}
      >
        <ListItem button id="lock-button" aria-haspopup="listbox" aria-controls="lock-menu" aria-label="when device is locked" aria-expanded={open ? "true" : undefined} onClick={handleClickListItem}>
          <>{settingActiveTenant ? <CircularProgress variant="indeterminate" size="1.3rem" color="secondary" /> : <ListItemText primary="Organization:" secondary={getActiveTenantName()} />}</>
        </ListItem>
      </List>
      <Menu
        id="lock-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "lock-button",
          role: "listbox"
        }}
      >
        <>
          {userTenants.map((tenant, index) => (
            <MenuItem key={tenant.tenantId} disabled={index === selectedIndex} selected={index === selectedIndex} onClick={(event) => handleMenuItemClick(event, index, tenant)}>
              {tenant.name}
            </MenuItem>
          ))}
          <Divider />
          <MenuItem key={"add-new"} onClick={(event) => handleMenuItemClick(event, null, null)}>
            New Organization
          </MenuItem>
        </>
      </Menu>
    </div>
  );
};
