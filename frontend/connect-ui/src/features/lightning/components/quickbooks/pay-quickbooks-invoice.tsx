import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { LineItem, LineItems, LineItemText, PayQuickBooksInvoiceContainer, Spacer, Subtotals, YourBill, YourBillHeader } from "./pay-quickbooks-invoice.styles";
import { PaymentSource, PaymentType } from "@blockspaces/shared/models/lightning/Invoice";
import { Button, Loading } from "@platform/common";
import { useUIStore } from "@ui";
import { useGetQuickBooksInvoice } from "../../hooks/queries";

export const PayQuickBooksInvoice = () => {
  const router = useRouter();
  const UI = useUIStore();
  const { data: qbInvoice, error: getQbInvoiceError } = useGetQuickBooksInvoice(router?.query?.tenantId?.toString(), router?.query?.erpId?.toString());

  useEffect(() => {
    if (!getQbInvoiceError) return;
    UI.showToast({
      message: `QuickBooks invoice not found.\nPlease check if you have the right invoice number: ${router.query.erpId}`,
      alertType: "error",
      position: {
        horizontal: "right",
        vertical: "top"
      },
      autoHideDuration: 5000
    });
  }, [getQbInvoiceError]);

  return (
    <PayQuickBooksInvoiceContainer>
      <YourBill>
        <YourBillHeader>YOUR BILL</YourBillHeader>
        <LineItems>
          <div>
            <Loading when={!qbInvoice}>
              {qbInvoice?.Line.map((item: any, index) => {
                if (!item.SalesItemLineDetail) return;
                return (
                  <>
                    <LineItem key={"line-item-" + index}>
                      <LineItemText size={1.4}>{item.SalesItemLineDetail.ItemRef.name}</LineItemText>
                      <LineItemText size={1.4}>${item.SalesItemLineDetail.UnitPrice.toFixed(2)}</LineItemText>
                    </LineItem>
                    {index !== qbInvoice?.Line.length - 1 && <Spacer size={1} color="#E8E8E8" />}
                  </>
                );
              })}
            </Loading>
          </div>
        </LineItems>
        <Subtotals>
          <Spacer size={2} color="#333654" />
          <LineItem subtotal>
            <LineItemText size={1.2}>Subtotal</LineItemText>
            <Loading when={!qbInvoice} maxWidth="8rem" right={0} margin={0}>
              <LineItemText size={1.2}>${qbInvoice?.TotalAmt - ((qbInvoice as any)?.TxnTaxDetail?.TotalTax?.toFixed(2) || 0)}</LineItemText>
            </Loading>
          </LineItem>
          <LineItem subtotal>
            <LineItemText size={1.2} weight={200} gray>
              Tax
            </LineItemText>
            <Loading when={!qbInvoice} maxWidth="8rem" right={0} margin={0}>
              <LineItemText size={1.2} weight={200} gray>
                ${qbInvoice?.TxnTaxDetail?.TotalTax?.toFixed(2) || 0.0}
              </LineItemText>
            </Loading>
          </LineItem>
          <LineItem subtotal>
            <LineItemText size={1.75}>Total</LineItemText>
            <Loading when={!qbInvoice} maxWidth="8rem" margin={0}>
              <LineItemText size={1.75}>${Number(qbInvoice?.TotalAmt).toFixed(2)}</LineItemText>
            </Loading>
          </LineItem>
        </Subtotals>
        <Button
          label="CONTINUE"
          variation="simple"
          customStyle={{ color: "#891AF8", borderColor: "#891AF8", marginTop: "1.5rem" }}
          onClick={() =>
            router.replace({
              pathname: `/multi-web-app/lightning/quickbooks`,
              query: { 
                tenantId: router.query.tenantId, 
                erpId: router.query.erpId, 
                modal: "checkout", 
                amount: Number(qbInvoice?.TotalAmt).toFixed(2), 
                source: "legacy-qbo" as PaymentSource }
            })
          }
        />
      </YourBill>
    </PayQuickBooksInvoiceContainer>
  );
};
