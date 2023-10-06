
import React from "react";
import Head from "next/head";
import { QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import toast, { Toaster } from "react-hot-toast";
import { AppThemeProvider } from "src/platform/providers/AppThemeProvider";
import AppBootstrap from "src/platform/components/AppBootstrap";




// Create react-query client
const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error: any, query) => {
      // if (error instanceof ApiResult) {
      //   if ((error as any).statusCode === 401 || (error as any).statusCode === 404) {
      //     // queryClient.invalidateQueries(query.queryKey);
      //   } else {
      //     const msg = (error as any).statusCode >= 500 ? "Uh oh, something happened" : error.message || "Uh oh, something happened";
      //     toast.error(msg, {
      //       duration: 5000,
      //       position: "top-right"
      //     });
      //   }
      // }
    }
  }),
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // remove chattiness
      refetchOnReconnect: false, // remove chattiness
      retry: false, // by default RQ will try the same call 3 times
      //useErrorBoundary: (error: any) => error?.statusCode === 401 || error?.statusCode >= 500
    },
    mutations: {
      retry: false, // by default RQ will try the same call 3 times
      //useErrorBoundary: (error: any) => error?.statusCode === 401 || error?.statusCode >= 500
    }
  }
});



function Application({ Component, pageProps }: any) {
  // Use the layout defined at the page level, if available
  const getLayout = Component.getLayout ?? ((page: any) => page);


  return (
    <>

      <Head>
        <title>Admin Portal</title>
        <meta property="og:title" content="BlockSpaces" key="title" />
        <link rel="icon" href="/admin-portal/favicon.ico" />
        <meta property="og:image" content="" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta property="lang" content="en" />
      </Head>

      <QueryClientProvider client={queryClient}>
        <AppThemeProvider>
          <AppBootstrap>
            <Toaster />
            <Component {...pageProps} />
          </AppBootstrap>
        </AppThemeProvider>
        <ReactQueryDevtools />
      </QueryClientProvider>

    </>
  );
}

export default Application;