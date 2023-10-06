
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect } from "react";
import MainLayoutAuthenticated from "src/platform/layout/MainLayoutAuthenticated";
import MainLayoutPublic from "src/platform/layout/MainLayoutPublic";
import { NextPageWithLayout } from "src/platform/types/base-page-props";

const Index = () => {
  const router = useRouter();


  useEffect(() => {
    if (!router.isReady) return;

  }, [router.isReady]);
  return (
    <>
      <MainLayoutAuthenticated>
      </MainLayoutAuthenticated>
    </>
  );
};



export default Index;
