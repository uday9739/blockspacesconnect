import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { LightningToQuickBooksModal, ModalText } from "./finalize-connection.styles";
import { Button, LoadingBar } from "@platform/common";
import { useUIStore } from "@ui";
import { QuickBooksConnectionSteps } from "@lightning/types";
import { AllSet, CreateContact as CreateContactIcon } from "@icons";
import { useCreateQuickbooksCustomer } from "@lightning/mutations";

const usePageData = () => {
  const {
    mutate: createQuickbooksCustomer,
    isLoading: createQuickbooksCustomerIsLoading,
    data: createQuickbooksCustomerResult,
    isSuccess: createQuickbooksCustomerIsSuccess,
    error: createQuickbooksCustomerError
  } = useCreateQuickbooksCustomer();

  return {
    createQuickbooksCustomer,
    createQuickbooksCustomerIsLoading,
    createQuickbooksCustomerResult,
    createQuickbooksCustomerIsSuccess,
    createQuickbooksCustomerError
  };
};

export const CreateContact = () => {
  const router = useRouter();
  const UI = useUIStore();
  const [syncing, setSyncing] = useState(true);
  const { createQuickbooksCustomer, createQuickbooksCustomerIsLoading, createQuickbooksCustomerResult, createQuickbooksCustomerIsSuccess, createQuickbooksCustomerError } = usePageData();
  const shouldRunCreate = createQuickbooksCustomerIsSuccess === false && createQuickbooksCustomerError === null;
  
  useEffect(() => {
    if (!shouldRunCreate) return;
    createQuickbooksCustomer({ GivenName: "Bitcoin Invoicing & Payments" });
  }, []);

  useEffect(() => {
    if (createQuickbooksCustomerError) {
      UI.showToast({
        message: "Customer exists in QuickBooks, select a customer from list.",
        alertType: "warning",
        position: {
          horizontal: "right",
          vertical: "top"
        },
        autoHideDuration: 5000
      });
      setSyncing(false);
      router.push({ pathname: router.pathname, query: { modal: "finalizeConnection", step: QuickBooksConnectionSteps.SelectContact } });  
    }
  }, [createQuickbooksCustomerError])
  
  if (createQuickbooksCustomerIsSuccess === true && syncing === true) {
    setSyncing(false);
  }

  return (
    <LightningToQuickBooksModal id="creating-quickbooks-contract-modal">
      {syncing ? <ModalText>Creating & Setting Contact</ModalText> : <ModalText>All Set!</ModalText>}
      {syncing ? <CreateContactIcon /> : <AllSet />}
      {syncing ? (
        <LoadingBar loaded={!syncing} width={80} barCount={30} speed={50} color={"#A81AF7"} />
      ) : (
        <Button id="btnBack" label="BACK TO BITCOIN INVOICING & PAYMENTS" variation="simple" width="25rem" onClick={() => router.push({ pathname: router.pathname, query: {} })} />
      )}
    </LightningToQuickBooksModal>
  );
};
