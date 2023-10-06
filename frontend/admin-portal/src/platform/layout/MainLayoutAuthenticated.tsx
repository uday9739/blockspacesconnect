import Box from "@mui/material/Box";
import { PropsWithChildren, useEffect, useState } from "react";
import ColorModeToggle from "../components/ColorModeToggle";
import Loading from "../components/Loading";
import { isAxiosError } from "axios";
import ErrorPill from "../components/ErrorPill";
import { useRouter } from "next/router";
import { useGetCurrentUser } from "../hooks/UserHooks";
import { AppBar, Container, Grid, Link, Toolbar } from "@mui/material";
import { useTheme } from "@mui/material/styles";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface MainLayoutAuthenticatedProps {

}

export default function MainLayoutAuthenticated({ children }: PropsWithChildren<MainLayoutAuthenticatedProps>) {
    const router = useRouter();
    const { data: user, isLoading: isUserLoading, isError: errorLoadingUser, error: userError, isSuccess: loadedUser } = useGetCurrentUser();
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        if (isUserLoading) return;
        if (loadedUser && !hasMounted) setHasMounted(true)

        if (errorLoadingUser) {
            router.push("/login");
        }

    }, [errorLoadingUser, isUserLoading, loadedUser, router.isReady, userError]);

    if (!hasMounted) {
        return <Loading isLoading />;
    }
    return <Box sx={{}}>
        <AuthenticatedHeader user={user} />
        {errorLoadingUser ? <ErrorPill errorTitle={"Error loading user record"} error={userError} /> : children}
    </Box>
}

//#region Header With User Account Menu
function AuthenticatedHeader(props: { user: any }) {
    const router = useRouter();
    const theme = useTheme();
    const isHome = router.pathname === "/";



    return (
        <>
            <AppBar
                id="main-app-bar"
                position="relative"
                style={{

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
                                    <Link href={`/admin-portal`} id="home-link" style={{ display: "flex" }}>
                                        Home
                                    </Link>
                                </Box>
                            </Grid>

                            {/* <Grid item> {EnvDisplay}</Grid> */}
                            <Grid item xs />
                            <Grid item>    Welcome {props?.user?.firstName}</Grid>
                            <Grid item>    <ColorModeToggle /></Grid>
                        </Grid>
                    </Toolbar>
                </Container>
            </AppBar>
        </>
    );
}
  //#endregion