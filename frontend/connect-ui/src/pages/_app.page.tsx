//#region Imports
// global import
import "src/platform/utils/axios";
// rext,next imports
import React from "react";
import Head from "next/head";
import Script from "next/script";
// 3rd part imports
import { ThemeProvider } from "styled-components";
import { QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { datadogRum } from "@datadog/browser-rum";
import toast, { Toaster } from "react-hot-toast";
// app code
import { ApplicationErrorFallback, RouteErrorBoundaryFallback, ErrorBoundaryPlus } from "@errors";
import ModalRoutesController from "@platform/routes/modals/index.controller";
import { GlobalToast, InfoTooltip } from "@platform/components/common";
import { UIProvider, ColorModeContext, useUIStore } from "@ui";
import { GlobalStyle, CssBaseline, ConnectMUITheme, ConnectMUIThemeProvider } from "@src/providers/theme";
import AppBootstrap from "@src/providers/ui/appBootstrap";
import ApiResult from "@blockspaces/shared/models/ApiResult";
import { RootStoreProvider } from "@platform/hooks";
import { GoogleAnalytics } from "nextjs-google-analytics";
//#endregion

//#region Datadog init
// datadogRum.init({
//   applicationId: process.env.DATADOG_APP_ID,
//   clientToken: process.env.DATADOG_CLIENT_TOKEN,
//   site: "datadoghq.com",
//   service: "connectui",
//   env: process.env.NODE_ENV,
//   // Specify a version number to identify the deployed version of your application in Datadog
//   version: process.env.npm_package_version,
//   sampleRate: 15,
//   premiumSampleRate: 15,
//   trackInteractions: true,
//   defaultPrivacyLevel: "mask-user-input"
// });

// datadogRum.startSessionReplayRecording();
//#endregion

// Create react-query client
const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error: any, query) => {
      if (error instanceof ApiResult) {
        if ((error as any).statusCode === 401 || (error as any).statusCode === 404) {
          // queryClient.invalidateQueries(query.queryKey);
        } else {
          const msg = (error as any).statusCode >= 500 ? "Uh oh, something happened" : error.message || "Uh oh, something happened";
          toast.error(msg, {
            duration: 5000,
            position: "top-right"
          });
        }
      }
    }
  }),
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // remove chattiness
      refetchOnReconnect: false, // remove chattiness
      retry: false, // by default RQ will try the same call 3 times
      useErrorBoundary: (error: any) => error.statusCode === 401 || error.statusCode >= 500
    },
    mutations: {
      retry: false, // by default RQ will try the same call 3 times
      useErrorBoundary: (error: any) => error.statusCode === 401 || error.statusCode >= 500
    }
  }
});

function Application({ Component, pageProps }) {
  // Use the layout defined at the page level, if available
  const getLayout = Component.getLayout ?? ((page) => page);
  const [mode, setMode] = React.useState<"light" | "dark">("light");
  const colorMode = React.useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
      }
    }),
    []
  );
  const theme = React.useMemo(() => ConnectMUITheme.createConnectTheme(mode), [mode]);

  return (
    <>
      <RootStoreProvider>
        <ErrorBoundaryPlus FallbackComponent={ApplicationErrorFallback}>
          <ColorModeContext.Provider value={colorMode}>
            <ConnectMUIThemeProvider theme={theme}>
              <GlobalStyle />
              <ThemeProvider theme={theme}>
                <Head>
                  <title>BlockSpaces</title>
                  <meta property="og:title" content="BlockSpaces" key="title" />
                  <link rel="icon" href="/connect/favicon.ico" />
                  <meta property="og:image" content="" />
                  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                  <meta
                    property="og:description"
                    content="The BlockSpaces Platform connects business applications to enterprise blockchain networks through fully managed infrastructure and configurable drag and drop workflows with clicks-or-code."
                  />
                  <meta property="lang" content="en" />
                  <Script type="text/javascript" id="hs-script-loader" async defer src="//js.hs-scripts.com/21941687.js"></Script>
                </Head>
                <CssBaseline />
                <UIProvider>
                  <QueryClientProvider client={queryClient}>
                    <AppBootstrap>
                      <GoogleAnalytics trackPageViews />
                      <Toaster />
                      <ModalRoutesController />
                      <InfoTooltip />
                      <GlobalToast />
                      {/* Main-Content (Pages/Routes)*/}
                      {getLayout(
                        <ErrorBoundaryPlus FallbackComponent={RouteErrorBoundaryFallback}>
                          {/* Route Level Error Boundary */}
                          <Component {...pageProps} />
                        </ErrorBoundaryPlus>
                      )}
                    </AppBootstrap>
                    <ReactQueryDevtools />
                  </QueryClientProvider>
                </UIProvider>
              </ThemeProvider>
            </ConnectMUIThemeProvider>
          </ColorModeContext.Provider>
        </ErrorBoundaryPlus>
      </RootStoreProvider>
    </>
  );
}

export default Application;
