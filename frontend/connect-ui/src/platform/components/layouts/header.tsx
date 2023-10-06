// framework
import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
// 3rd party
import AppBar from "@mui/material/AppBar";
import AccountCircle from "@mui/icons-material/AccountCircle";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { Alert, Box, Container, Divider, Icon, ListItemIcon, ListItemText, Paper } from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import ContactSupportIcon from "@mui/icons-material/ContactSupport";
import { useTheme } from "@mui/material/styles";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import NewReleaseIcon from "@mui/icons-material/NewReleases";
import BarChartIcon from "@mui/icons-material/BarChart";
import PersonIcon from "@mui/icons-material/Person";
import styled from "styled-components";
import DeveloperModeIcon from "@mui/icons-material/DeveloperMode";
import DeveloperBoardIcon from "@mui/icons-material/DeveloperBoard";
// app imports
import { UserNotifications } from "@platform/components/dashboards/user-notifications/user-notifications";
import { ColorModeContext, requireAuthenticationObservable, useUIStore } from "@providers";
import { Logo } from "@icons";
import { FeatureFlags } from "@blockspaces/shared/models/feature-flags/FeatureFlags";
import { useLogout } from "@src/platform/hooks/user/mutations";
import { useGetCurrentUser, useIsUserFeatureEnabled, useUserHasRole } from "@src/platform/hooks/user/queries";
import { Article, FiberNew, Science } from "@mui/icons-material";
import Tooltip from "@mui/material/Tooltip";
import { SelectActiveTenant } from "../select-active-tenant";
import { TenantType } from "@blockspaces/shared/models/tenants";
import { useGetTenantMemberPermissions } from "@src/platform/hooks/tenant/queries";
import { TenantRole } from "@blockspaces/shared/dtos/tenants";

//#region Props
interface HeaderProps {}
//#endregion

//#region Color Mode ** future
function ToggleColorMode() {
  const theme = useTheme();
  const colorMode = React.useContext(ColorModeContext);
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        color: "text.primary"
      }}
    >
      {theme.palette.mode} mode
      <IconButton sx={{ ml: 1 }} onClick={colorMode.toggleColorMode} color="inherit">
        {theme.palette.mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
      </IconButton>
    </Box>
  );
}
//#endregion

//#region User Account Menu
function GlobalUserMenu() {
  const theme = useTheme();
  const router = useRouter();
  const { env } = useUIStore();
  const isProd = env === "prod";
  const isLocal = env === "local";
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const { data: user } = useGetCurrentUser();
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const goTo = async (path: string, queryObj?) => {
    router.push({
      pathname: path,
      query: queryObj
    });
  };
  const hasRole = useUserHasRole()

  return (
    <>
      <IconButton id="basic-button" aria-controls={open ? "basic-menu" : undefined} aria-haspopup="true" aria-expanded={open ? "true" : undefined} onClick={handleClick} color="inherit">
        <AccountCircle color="primary" />
      </IconButton>
      <Paper>
        <Menu
          id="basic-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          MenuListProps={{
            "aria-labelledby": "basic-button"
          }}
        >
          <MenuItem disabled> {`${user?.firstName || "Satoshi"} ${user?.lastName || "Nakamoto"}`}</MenuItem>
          {/*Settings  */}
          <MenuItem id="user-settings-menu-item" onClick={handleClose} onClickCapture={() => goTo(`${router.pathname}`, { ...router.query, modal: "profile" })}>
            <ListItemIcon>
              <PersonIcon />
            </ListItemIcon>
            <ListItemText>Personal Settings</ListItemText>
          </MenuItem>
          {/* Org Settings  */}
          <Grid>
            {user?.featureFlags?.tenantsModule === true && user?.activeTenant && user?.activeTenant?.tenantType !== TenantType.PERSONAL ? (
              <>
                <MenuItem id="org-settings-menu-item" onClick={handleClose} onClickCapture={() => goTo(`${router.pathname}`, { ...router.query, modal: "organization-settings" })}>
                  <ListItemIcon>
                    <SettingsIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>
                    Organization Settings&nbsp;
                    <Icon style={{ color: theme.palette.success.dark }}>
                      <Tooltip title="New">
                        <FiberNew />
                      </Tooltip>
                    </Icon>
                  </ListItemText>
                  <Typography variant="body2" color="text.secondary">
                    {" "}
                    &nbsp;
                  </Typography>
                </MenuItem>
              </>
            ) : (
              <></>
            )}
          </Grid>
          {/*Billing  */}
          {hasRole(user?.id, TenantRole.BILLING_ADMIN) ? (
            <>
              <MenuItem id="billing-module-menu-item" onClick={handleClose} onClickCapture={() => goTo("/billing")}>
                <ListItemIcon>
                  <BarChartIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>
                  Billing&nbsp;
                </ListItemText>
                <Typography variant="body2" color="text.secondary">
                  {" "}
                  &nbsp;
                </Typography>
              </MenuItem>
            </>
          ) : null}
          {/* Documentation */}
          <MenuItem onClick={handleClose} id="documentation-menu-item">
            <Link
              style={{
                display: "flex",
                textDecoration: "none",
                color: "inherit"
              }}
              passHref
              target={"_blank"}
              href="https://docs.blockspaces.com"
            >
              <ListItemIcon>
                <Article fontSize="small" />
              </ListItemIcon>
              <ListItemText>
                Documentation&nbsp;
              </ListItemText>
            </Link>
          </MenuItem>
          {/* Help Desk */}
          <MenuItem onClick={handleClose} id="support-menu-item">
            <Link
              style={{
                display: "flex",
                textDecoration: "none",
                color: "inherit"
              }}
              passHref
              target="_blank" 
              href="https://blockspaces.com/contact-us">
                <ListItemIcon>
                  <ContactSupportIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Get in touch with our support team</ListItemText>
              </Link>
          </MenuItem>
          {/* Dev Samples */}
          {isLocal === true ? (
            <MenuItem onClick={handleClose} onClickCapture={() => goTo(`/dev`, null)} style={{ color: theme.palette.error.main }}>
              <ListItemIcon>
                <DeveloperModeIcon />
              </ListItemIcon>
              <ListItemText>Development Examples</ListItemText>
            </MenuItem>
          ) : null}
          {user?.featureFlags.embedBMP === true ? (
            <MenuItem onClick={handleClose} onClickCapture={() => goTo(`/integration`, null)} style={{ color: theme.palette.text.primary }}>
              <ListItemIcon>
                <DeveloperBoardIcon />
              </ListItemIcon>
              <ListItemText>Multiweb App Designer</ListItemText>&nbsp;
              <Icon style={{ color: theme.palette.success.dark }}>
                <Tooltip title="Experimental">
                  <Science />
                </Tooltip>
              </Icon>
            </MenuItem>
          ) : null}
          <Divider />
          {/* Logout Action */}
          <MenuItem id="logout" onClick={handleClose} onClickCapture={() => goTo(`/logout`, null)} style={{ color: theme.palette.error.main }}>
            <ListItemIcon style={{ color: theme.palette.error.main }}>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Logout</ListItemText>
          </MenuItem>
        </Menu>
      </Paper>
    </>
  );
}
//#endregion

//#region Supporting styles
export const HeaderLogo = ({ style }: { style: any }) => {
  return (
    <svg style={style} width="136" height="135" viewBox="0 0 136 135" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M30.2587 21.0846C32.6329 16.7761 37.1629 14.1001 42.0823 14.1001L94.1957 14.1001C99.1699 14.1001 103.741 16.8354 106.092 21.2187L127.167 60.5067C129.297 64.4782 129.305 69.2508 127.188 73.2294L106.082 112.897C103.738 117.303 99.1542 120.056 94.1637 120.056H42.1897C37.2154 120.056 32.6442 117.32 30.293 112.937L8.7792 72.8272C6.61583 68.7939 6.64334 63.9392 8.85227 59.9306L30.2587 21.0846Z"
        fill="white"
        stroke="#F1F3FF"
      />
      <rect x="1.20711" y="67.5" width="94.4594" height="94.4594" rx="7.5" transform="rotate(-45 1.20711 67.5)" fill="white" stroke="#F1F3FF" />
      <g filter="url(#filter0_d_887_13698)">
        <path
          d="M76.6625 68.004H63.7126C61.2212 68.004 59.2017 70.0236 59.2017 72.515V85.4649C59.2017 87.9561 61.2212 89.9758 63.7126 89.9758H76.6625C79.1537 89.9758 81.1735 87.9561 81.1735 85.4649V72.515C81.1735 70.0236 79.1537 68.004 76.6625 68.004ZM76.6625 70.6459C77.693 70.6459 78.5314 71.4842 78.5314 72.515V85.4649C78.5314 86.4956 77.693 87.3338 76.6625 87.3338H63.7126C62.6819 87.3338 61.8435 86.4956 61.8435 85.4649V72.515C61.8435 71.4842 62.6819 70.6459 63.7126 70.6459H76.6625Z"
          fill="url(#paint0_linear_887_13698)"
        />
        <path
          d="M76.6625 43.4317H63.7126C61.2212 43.4317 59.2017 45.4512 59.2017 47.9426V60.8925C59.2017 63.3837 61.2212 65.4034 63.7126 65.4034H76.6625C79.1537 65.4034 81.1735 63.3837 81.1735 60.8925V47.9426C81.1735 45.4512 79.1537 43.4317 76.6625 43.4317ZM76.6625 46.0735C77.693 46.0735 78.5314 46.9118 78.5314 47.9426V60.8925C78.5314 61.9232 77.693 62.7614 76.6625 62.7614H63.7126C62.6819 62.7614 61.8435 61.9232 61.8435 60.8925V47.9426C61.8435 46.9118 62.6819 46.0735 63.7126 46.0735H76.6625Z"
          fill="url(#paint1_linear_887_13698)"
        />
        <path d="M71.448 68.0017H68.8062V65.3956H71.448V68.0017Z" fill="url(#paint2_linear_887_13698)" />
        <path
          d="M70.1964 31.4492C50.0988 31.4492 34.5244 47.0236 34.5244 67.1212C34.5244 87.2188 50.0988 102.793 70.1964 102.793C90.294 102.793 105.868 87.2188 105.868 67.1212C105.868 47.0236 90.294 31.4492 70.1964 31.4492ZM70.1964 34.4006C74.6154 34.4006 78.9002 35.2652 82.9317 36.9705C86.8276 38.6182 90.3273 40.9779 93.3334 43.9842C96.3395 46.9903 98.6994 50.4903 100.347 54.3859C102.052 58.4175 102.917 62.7022 102.917 67.1212C102.917 71.5402 102.052 75.825 100.347 79.8565C98.6994 83.7524 96.3395 87.2521 93.3334 90.2582C90.3273 93.2646 86.8276 95.6242 82.9317 97.272C78.9002 98.9772 74.6154 99.8419 70.1964 99.8419C65.7774 99.8419 61.4927 98.9772 57.4611 97.272C53.5652 95.6242 50.0655 93.2646 47.0594 90.2582C44.0533 87.2521 41.6934 83.7524 40.0457 79.8565C38.3404 75.825 37.4758 71.5402 37.4758 67.1212C37.4758 62.7022 38.3404 58.4175 40.0457 54.3859C41.6934 50.4903 44.0533 46.9903 47.0594 43.9842C50.0655 40.9779 53.5652 38.6182 57.4611 36.9705C61.4927 35.2652 65.7774 34.4006 70.1964 34.4006Z"
          fill="url(#paint3_linear_887_13698)"
        />
      </g>
      <defs>
        <filter id="filter0_d_887_13698" x="32.5244" y="29.4492" width="75.3438" height="75.344" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
          <feOffset />
          <feGaussianBlur stdDeviation="1" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.94902 0 0 0 0 0.988235 0 0 0 0 1 0 0 0 0.5 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_887_13698" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_887_13698" result="shape" />
        </filter>
        <linearGradient id="paint0_linear_887_13698" x1="59.3373" y1="79.5324" x2="80.1562" y2="79.1934" gradientUnits="userSpaceOnUse">
          <stop stopColor="#696FE2" />
          <stop offset="1" stopColor="#7A69E2" />
        </linearGradient>
        <linearGradient id="paint1_linear_887_13698" x1="59.3373" y1="54.9601" x2="80.1562" y2="54.621" gradientUnits="userSpaceOnUse">
          <stop stopColor="#696FE2" />
          <stop offset="1" stopColor="#7A69E2" />
        </linearGradient>
        <linearGradient id="paint2_linear_887_13698" x1="68.8225" y1="66.763" x2="71.3257" y2="66.7217" gradientUnits="userSpaceOnUse">
          <stop stopColor="#696FE2" />
          <stop offset="1" stopColor="#7A69E2" />
        </linearGradient>
        <linearGradient id="paint3_linear_887_13698" x1="34.9648" y1="68.8828" x2="102.565" y2="67.7818" gradientUnits="userSpaceOnUse">
          <stop stopColor="#696FE2" />
          <stop offset="1" stopColor="#7A69E2" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export const BottomHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 4.875rem;
  border-top: 1px solid ${(p) => p.theme.lighterBlue};
  border-bottom: 1px solid ${(p) => p.theme.lighterBlue};
`;

export const AppNavigation = styled.div<{ side: "left" | "right" }>`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: ${(p) => (p.side === "left" ? "flex-end" : "flex-start")};
`;
//#endregion

//#region Header With User Account Menu
function AuthenticatedHeader(props: HeaderProps) {
  const router = useRouter();
  const theme = useTheme();
  const uiStore = useUIStore();
  const isHome = router.pathname === "/connect";
  const isUserFeatureEnabled = useIsUserFeatureEnabled();

  const EnvDisplay = React.useMemo(() => {
    switch (uiStore.env) {
      case "local": {
        return (
          <Alert icon={false} variant="filled" severity="error">
            Localhost
          </Alert>
        );
      }
      case "dev": {
        return (
          <Alert icon={false} variant="filled" severity="error">
            Development
          </Alert>
        );
      }
      case "stg": {
        return (
          <Alert icon={false} variant="filled" severity="info">
            Staging
          </Alert>
        );
      }
      default:
        return <></>;
    }
  }, [uiStore.env]);

  return (
    <>
      <AppBar
        id="main-app-bar"
        position="relative"
        style={{
          borderBottom: `1px solid ${theme.lighterBlue}`,
          background: isHome ? `linear-gradient(90deg, #F3F3FD 2.18%, #F3F3FD00 32%, #F3F3FD00 62.79%, #F3F3FD 94.55%)` : undefined
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters style={{ flexGrow: 1 }}>
            <Grid container spacing={1} alignItems="center" flexGrow={1}>
              <Grid
                item
                style={{
                  paddingLeft: "0px !important"
                }}
              >
                {/* Home Icon */}
                <Box
                  id="home-icon-wrapper"
                  style={{
                    color: theme.palette.primary.main,
                    cursor: "pointer",
                    display: isHome ? "none" : "flex"
                  }}
                >
                  <Link href={`/connect`} id="home-link" style={{ display: "flex" }}>
                    <Logo />
                  </Link>
                </Box>
              </Grid>
              <Grid item> {EnvDisplay}</Grid>
              <Grid item xs />
              <Grid>{isUserFeatureEnabled(FeatureFlags.tenantsModule) === true ? <SelectActiveTenant /> : <></>}</Grid>
              <Grid item id="user-notification-container">
                <UserNotifications />
              </Grid>
              <Grid item id="user-menu-container">
                <GlobalUserMenu />
              </Grid>
            </Grid>
          </Toolbar>
        </Container>
      </AppBar>
      {isHome === true ? (
        <BottomHeader>
          <AppNavigation side={"left"}></AppNavigation>
          <HeaderLogo
            style={{
              top: "3px",
              height: "10rem",
              width: "10rem",
              margin: "0.5rem",
              zIndex: "1300"
            }}
          />
          <AppNavigation side={"right"}></AppNavigation>
        </BottomHeader>
      ) : null}
    </>
  );
}
//#endregion

export default requireAuthenticationObservable(AuthenticatedHeader);
