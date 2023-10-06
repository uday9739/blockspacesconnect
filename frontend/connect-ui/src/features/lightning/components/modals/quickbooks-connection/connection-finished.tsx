import { useEffect } from "react";
import { useRouter } from "next/router";
import { LightningToQuickBooksModal, ModalText } from "./finalize-connection.styles";
import { Button } from "@platform/common";
import { AllSet } from "@icons";
import { useCheckQuickBooksIntegrationForTenant } from "@lightning/queries";

export const ConnectionFinished = () => {
  const router = useRouter();
  const { data: checkQuickBooksIntegrationForTenantResult } = useCheckQuickBooksIntegrationForTenant();
  return (
    <LightningToQuickBooksModal id="quickbooks-integration-finished-modal">
      <ModalText>All Set!</ModalText>
      <AllSet />
      <Button
        disabled={checkQuickBooksIntegrationForTenantResult === false}
        label="BACK TO BITCOIN INVOICING & PAYMENTS"
        variation="simple"
        width="25rem"
        onClick={() => router.push({ pathname: router.pathname, query: {} })}
      />
    </LightningToQuickBooksModal>
  );
};
