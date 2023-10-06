//framework
import { useRouter } from "next/router";

//app
import { NextPageWithLayout } from "@platform/types/base-page-props";
import MainLayoutAuthenticated from "@src/platform/components/layouts/main-authenticated-layout";
import styled from "styled-components";
import { InvoiceDetails } from "@src/features/billing/components/invoice-details";
import Link from "next/link";

export const PageContainer = styled.div`
  max-width: 1536px;
  margin: auto;
  height: 100%;
`;

const InvoiceDetailPage: NextPageWithLayout = () => {
  const router = useRouter();
  const { id } = router.query;
  return (
    <PageContainer>
      <InvoiceDetails id={id?.toString()} />
    </PageContainer>
  );
};

InvoiceDetailPage.getLayout = function getLayout(page) {
  return <MainLayoutAuthenticated id="invoice-details">{page}</MainLayoutAuthenticated>;
};

export default InvoiceDetailPage;
