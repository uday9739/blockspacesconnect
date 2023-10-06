// framework
import { PropsWithChildren, useEffect } from "react";
import { useRouter } from "next/router";
// 3rd party
import { Box, Fab, Paper, Tooltip } from "@mui/material";
// custom
import AuthenticatedHeader from "@platform/components/layouts/header";
import { requireAuthenticationObservable } from "@src/providers";
import { isUserAuthenticated } from "@src/platform/hooks/user/queries";
import { useAuthRedirect } from "@src/platform/hooks/user/mutations";
import { UrlObject } from "url";
import LiveHelpIcon from "@mui/icons-material/LiveHelp";

const RequireAuth = requireAuthenticationObservable(() => <></>);
interface LayoutProps {
  id: string;
  hideGlobalHeaderBar?: boolean;
  byPassAuth?: boolean;
}

const MainLayoutAuthenticated = ({ id, children, hideGlobalHeaderBar: hideHaveBar = false, byPassAuth = false }: PropsWithChildren<LayoutProps>) => {
  const isLoggedIn = isUserAuthenticated();
  const router = useRouter();
  const { mutate: cacheAuthRedirect } = useAuthRedirect();

  useEffect(() => {
    if (!isLoggedIn && !byPassAuth) {
      const url: UrlObject = { pathname: router.route, query: router.query };
      cacheAuthRedirect({ url });
      router.push("/logout");
    }
  }, [router.isReady, isLoggedIn]);

  if (!isLoggedIn && !byPassAuth) return <></>;
  return (
    <>
      {!byPassAuth ? <RequireAuth /> : null}
      {hideHaveBar === false && !byPassAuth ? <AuthenticatedHeader /> : null}
      <Paper
        id={id}
        sx={{
          borderRadius: "none",
          boxShadow: "none",
          overflow: "auto",
          height: "100%"
        }}
      >
        {children}
        <Box
          sx={{
            display: "flex",
            justifyContent: "end",
            position: "fixed",
            left: 0,
            bottom: 0,
            width: "100%"
          }}
        >
          <Tooltip title="Click for support">
            <Fab color="primary" sx={{ margin: "0 75px 15px 0" }} href="https://discord.gg/7FTJnha" target={"_blank"}>
              <LiveHelpIcon />
            </Fab>
          </Tooltip>
        </Box>
      </Paper>
    </>
  );
};
export default MainLayoutAuthenticated;
