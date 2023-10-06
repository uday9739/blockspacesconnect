import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { LightningToQuickBooksModal, ModalText } from "./finalize-connection.styles";
import { Button, Loading } from "@platform/common";
import { IDropdownItem, Dropdown } from "@platform/common";
import { QuickBooksConnectionSteps } from "@lightning/types";
import { useUIStore } from "@ui";
import { useListQuickbooksCustomers } from "@src/features/lightning/hooks/queries/integrations";
import { useSaveQboCustomerId } from "@src/features/lightning/hooks/mutations/integrations";

const usePageData = () => {
  const { data: quickbooksCustomers, isLoading: quickbooksCustomersIsLoading, error: quickbooksCustomersError } = useListQuickbooksCustomers();
  const { mutate: saveQboCustomerId, isLoading: saveQboCustomerIdIsLoading, error: saveQboCustomerIdError, isSuccess: saveQboCustomerIdSuccess } = useSaveQboCustomerId();
  return {
    //
    quickbooksCustomers,
    quickbooksCustomersIsLoading,
    quickbooksCustomersError,
    //
    saveQboCustomerId,
    saveQboCustomerIdIsLoading,
    saveQboCustomerIdError,
    saveQboCustomerIdSuccess
  };
};

export const SelectContact = () => {
  const router = useRouter();
  const { quickbooksCustomers, quickbooksCustomersIsLoading, quickbooksCustomersError, saveQboCustomerId, saveQboCustomerIdIsLoading, saveQboCustomerIdError, saveQboCustomerIdSuccess } =
    usePageData();
  const UI = useUIStore();
  const [customers, setCustomers] = useState<IDropdownItem[]>(null);

  if (quickbooksCustomers && !customers) {
    const formattedList: IDropdownItem[] = quickbooksCustomers.map((item) => ({
      id: item.id,
      content: item.givenName
    }));
    setCustomers(formattedList);
  }

  if (saveQboCustomerIdSuccess) {
    router.push({ pathname: router.pathname, query: { modal: "finalizeConnection", step: QuickBooksConnectionSteps.ConnectionFinished } });
  }

  const saveCustomer = async (id: string) => {
    if (id === "") {
      return UI.showToast({
        message: `Please select a customer from the dropdown menu.`,
        alertType: "error",
        position: {
          horizontal: "right",
          vertical: "top"
        },
        autoHideDuration: 5000
      });
    }
    saveQboCustomerId({ id });
  };

  return (
    <LightningToQuickBooksModal style={{ width: "609px" }} id="select-quickbooks-integration-customer">
      <ModalText style={{ marginBottom: "2rem" }}>Select A Customer</ModalText>
      {customers ? (
        <Dropdown
          id={1}
          icon={<img alt="" src="/images/logos/quickbooks.png" />}
          header="SELECT CONTACT"
          placeholder="My Contact"
          label="CONTINUE"
          items={customers}
          onSubmit={(id) => saveCustomer(id)}
        />
      ) : (
        <Loading when={!customers} />
      )}
      <Button
        label="BACK TO SET DEFAULT"
        height="40px"
        customStyle={{ border: "none", boxShadow: "none", textDecoration: "underline", color: "#E4E0E5" }}
        variation="simple"
        id="btnBack"
        onClick={() => router.push({ pathname: router.pathname, query: { modal: "finalizeConnection", step: QuickBooksConnectionSteps.SetDefaultAccount } })}
      />
    </LightningToQuickBooksModal>
  );
};
