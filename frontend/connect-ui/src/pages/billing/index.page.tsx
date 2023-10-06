//framework
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
//app
import { NextPageWithLayout } from "@platform/types/base-page-props";
import MainLayoutAuthenticated from "@src/platform/components/layouts/main-authenticated-layout";
import styled from "styled-components";
import { Box } from "@mui/system";
import { SubscriptionOverview } from "@src/features/billing/components/subscription-overview";
import { useGetConnectSubscription } from "@src/platform/hooks/user/queries";
import { Loading } from "@src/platform/components/common";
import { BillingHistory } from "@src/features/billing/components/billing-history";
import { PaymentMethods } from "@src/features/billing/components/payment-methods";

export const PageContainer = styled.div`
  max-width: 1536px;
  margin: auto;
  height: 100%;
`;

const BillingPage: NextPageWithLayout = () => {
  const router = useRouter();
  const { data: connectSubscription, isLoading } = useGetConnectSubscription();

  if (isLoading) return <Loading when={isLoading}></Loading>;

  return (
    <PageContainer>
      {/* Subscription Info */}
      <SubscriptionOverview connectSubscription={connectSubscription} />
      {/* Payment Methods */}
      <PaymentMethods connectSubscription={connectSubscription} />
      {/* History */}
      <BillingHistory connectSubscription={connectSubscription} />
    </PageContainer>
  );
};

BillingPage.getLayout = function getLayout(page) {
  return <MainLayoutAuthenticated id="billing-page">{page}</MainLayoutAuthenticated>;
};

export default BillingPage;
