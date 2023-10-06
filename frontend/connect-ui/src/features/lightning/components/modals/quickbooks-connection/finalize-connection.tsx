import React from "react";
import { useRouter } from "next/router";
import { FinalizeConnectionStyles } from "./finalize-connection.styles";
import { SyncConnection } from "./sync-connection";
import { DefaultAccounts } from "./default-accounts";
import { CreateContact } from "./create-contact";
import { ConnectionFinished } from "./connection-finished";
import { NotConnected } from "./not-connected";
import { SelectContact } from "./select-contact";
import { QuickBooksConnectionSteps } from "@lightning/types";
import { useCheckQuickBooksIntegrationForTenant } from "@lightning/queries";

export const FinalizeConnection = () => {
  const router = useRouter();
  const { step } = router.query;
  const { data: quickBooks } = useCheckQuickBooksIntegrationForTenant();

  switch (step) {
    case QuickBooksConnectionSteps.NotConnected:
      return (
        <FinalizeConnectionStyles id="finalize-connection-container">
          <NotConnected />
        </FinalizeConnectionStyles>
      );
    case QuickBooksConnectionSteps.Syncing:
      return (
        <FinalizeConnectionStyles id="finalize-connection-container">
          <SyncConnection />
        </FinalizeConnectionStyles>
      );
    case QuickBooksConnectionSteps.SetDefaultAccount:
      return (
        <FinalizeConnectionStyles id="finalize-connection-container">
          <DefaultAccounts />
        </FinalizeConnectionStyles>
      );
    case QuickBooksConnectionSteps.SelectContact:
      return (
        <FinalizeConnectionStyles id="finalize-connection-container">
          <SelectContact />
        </FinalizeConnectionStyles>
      );
    case QuickBooksConnectionSteps.CreateContact:
      return (
        <FinalizeConnectionStyles id="finalize-connection-container">
          <CreateContact />
        </FinalizeConnectionStyles>
      );
    case QuickBooksConnectionSteps.ConnectionFinished:
      return (
        <FinalizeConnectionStyles id="finalize-connection-container">
          <ConnectionFinished />
        </FinalizeConnectionStyles>
      );
    default:
      return <FinalizeConnectionStyles id="finalize-connection-container">{quickBooks ? <ConnectionFinished /> : <NotConnected />}</FinalizeConnectionStyles>;
  }
};
