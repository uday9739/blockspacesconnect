import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/router";
import { ModalText, LightningToQuickBooksModal } from "./finalize-connection.styles";
import { useUIStore } from "@ui";
import { Button, LoadingBar } from "@platform/common";
import { QuickBooksConnectionSteps } from "@lightning/types";
import { ConnectedToQuickBooks, SyncingToQuickBooks } from "@icons";
import { useCreateQuickBooksBillingAccount, useStoreQuickBooksCredentials } from "@lightning/mutations";

const usePageData = () => {
  const createQuickBooksBillingAccount = useCreateQuickBooksBillingAccount();
  const {
    mutate: storeQuickBooksCredentials,
    error: storeQuickBooksCredentialsError,
    isLoading: storeQuickBooksCredentialsIsLoading,
    data: storeQuickBooksCredentialsResults,
    isSuccess: storeQuickBooksCredentialsIsSuccess
  } = useStoreQuickBooksCredentials();

  return {
    createQuickBooksBillingAccount,
    storeQuickBooksCredentials,
    storeQuickBooksCredentialsError,
    storeQuickBooksCredentialsIsLoading,
    storeQuickBooksCredentialsResults,
    storeQuickBooksCredentialsIsSuccess
  };
};

export const SyncConnection = observer(() => {
  const UI = useUIStore();
  const router = useRouter();
  const { realmId, state, qbUrl } = router.query;
  const [syncing, setSyncing] = useState(true);
  const {
    createQuickBooksBillingAccount,
    storeQuickBooksCredentials,
    storeQuickBooksCredentialsError,
    storeQuickBooksCredentialsIsLoading,
    storeQuickBooksCredentialsIsSuccess,
    storeQuickBooksCredentialsResults
  } = usePageData();
  const _haveQbOAuthCredParams = realmId !== null && state !== null && qbUrl !== null;
  const _haveAlreadyCalledStoreQuickBooksCredentials = storeQuickBooksCredentialsError === null && storeQuickBooksCredentialsIsSuccess === true;

  useEffect(() => {
    if (_haveQbOAuthCredParams && _haveAlreadyCalledStoreQuickBooksCredentials === false) {
      storeQuickBooksCredentials({
        url: qbUrl as string,
        realmId: realmId as string,
        state: state as string
      });
    }
  }, []);

  useEffect(() => {
    if (_haveAlreadyCalledStoreQuickBooksCredentials) {
      createAccount();
    }
  }, [_haveAlreadyCalledStoreQuickBooksCredentials]);

  const createAccount = async () => {
    let account = null;
    try {
      account = await createQuickBooksBillingAccount.mutateAsync({
        Name: "Bitcoin Invoicing & Payments",
        AccountType: "Bank",
        Classification: "Asset",
        AccountSubType: "CashOnHand",
        FullyQualifiedName: "Bitcoin Invoicing & Payments"
      });
    } catch (error) {
      // eat
    } finally {
      setSyncing(false);
    }
    if (!account)
      return UI.showToast({
        message: "Account already exists",
        alertType: "warning",
        showCloseButton: true,
        position: {
          horizontal: "right",
          vertical: "top"
        }
      });
  };

  return (
    <LightningToQuickBooksModal id="syncing-quickbooks-modal">
      {syncing ? <ModalText>Connecting to QuickBooks</ModalText> : <ModalText>QuickBooks Connected!</ModalText>}
      {syncing ? <SyncingToQuickBooks /> : <ConnectedToQuickBooks />}
      {syncing ? (
        <LoadingBar loaded={!syncing} barCount={30} width={80} speed={50} color={"#2ba01d"} />
      ) : (
        <Button
          label="CONTINUE"
          variation="simple"
          onClick={() => router.push({ pathname: router.pathname, query: { modal: "finalizeConnection", step: QuickBooksConnectionSteps.SetDefaultAccount } })}
        />
      )}
    </LightningToQuickBooksModal>
  );
});
