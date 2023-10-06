import { useRouter } from "next/router";
import { NextPageWithLayout } from "@platform/types/base-page-props";
import MainLayoutAuthenticated from "@src/platform/components/layouts/main-authenticated-layout";
import { useCyclr } from "@platform/hooks/cyclr/queries"; 

const IntegrationsPage: NextPageWithLayout = () => {
  const router = useRouter();

  useCyclr();
  const { embedLink, isFetching } = useCyclr();
  
  return !isFetching && <iframe width="100%" src={embedLink} style={{"border":"none","height":"95%"}}></iframe>;
};

IntegrationsPage.getLayout = function getLayout(page) {
  return <MainLayoutAuthenticated id="integration-home-page">{page}</MainLayoutAuthenticated>;
};

export default IntegrationsPage;
