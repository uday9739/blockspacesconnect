import { useEffect } from "react";
import { useRouter } from "next/router";
import { LineItem, LineItemText, PayErpInvoiceContainer, Subtotals, YourBill, YourBillHeader } from "./pay-erp-invoice.styles";
import { PaymentSource } from "@blockspaces/shared/models/lightning/Invoice";
import { Button, Loading } from "@platform/common";
import { useUIStore } from "@ui";
import { useBitcoinPrice, useGetErpInvoice, useNodeBalance, useNodeDoc } from "@lightning/queries";
import { ErpMetadata } from "@blockspaces/shared/models/lightning/Integration";

export const PayErpInvoice = () => {
  const router = useRouter();
  const UI = useUIStore();
  const { data: erpInvoice, error: erpInvoiceError } = useGetErpInvoice(router?.query?.tenantId?.toString(), router?.query?.erpId?.toString(), router?.query?.domain?.toString());
  const { bitcoinPrice } = useBitcoinPrice("usd")
  const { nodeBalance } = useNodeBalance()
  const { nodeDoc } = useNodeDoc();

  useEffect(() => {
    if (!erpInvoiceError) return;
    UI.showToast({
      message: `QuickBooks invoice not found.\nPlease check if you have the right invoice number: ${router.query.qbId}`,
      alertType: "error",
      position: {
        horizontal: "right",
        vertical: "top"
      },
      autoHideDuration: 5000
    });
  }, [erpInvoiceError]);

  const buildErpMetadata = () => {
    const erpMetadata: ErpMetadata[] = [
      {
        dataType: "erpInvoiceId",
        domain: erpInvoice.metadata.domain,
        value: erpInvoice.metadata.externalId
      }
    ]
    return JSON.stringify(erpMetadata)
  }

  const lowReceivableBalanceToast = (receivableBalance) => {
    const fiatBalance = ((receivableBalance.remote_balance.sat / 100_000_000 ) * Number(bitcoinPrice.data.exchangeRate)).toFixed(2)
    return UI.showToast({
      message: `The person you are trying to pay does not have enough receivable balance to accept this transaction. Available liquidity: ${Number(receivableBalance.remote_balance.sat).toLocaleString()} sats ($${fiatBalance.toLocaleString()}).`,
      alertType: "error",
      position: {
        horizontal: "right",
        vertical: "top"
      },
      autoHideDuration: 5000,
    })
  }

  const openCheckoutScreen = async () => {
    let receivableBalance = nodeBalance?.data
    const amountToReceive = Math.round(Number(erpInvoice?.invoiceData?.totalAmt) / Number(bitcoinPrice?.data.exchangeRate)) * 100_000_000
    if (amountToReceive >= Number(receivableBalance?.remote_balance.sat)) return lowReceivableBalanceToast(receivableBalance)
    return router.replace({
      pathname: `/multi-web-app/lightning/erp`,
      query: {
        tenantId: router.query.tenantId,
        erpId: router.query.erpId,
        domain: router.query.domain,
        modal: "checkout",
        amount: Number(erpInvoice?.invoiceData?.totalAmt).toFixed(2),
        erpMetadata: buildErpMetadata(),
        source: "erpinvoice" as PaymentSource
      }
    })
  }

  return (
    <PayErpInvoiceContainer>
      <YourBill>
        <YourBillHeader>YOUR BILL</YourBillHeader>
        <div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
        <Subtotals>
          {/* <Spacer size={3} color="#333654" /> */}
          <LineItem subtotal>
            {/* <LineItemText size={1.75}>Total</LineItemText> */}
            <Loading when={!erpInvoice} maxWidth="8rem" margin={0}>
              <LineItemText size={3}>${Number(erpInvoice?.invoiceData?.totalAmt).toFixed(2)}</LineItemText>
            </Loading>
          </LineItem>
        </Subtotals>
        <Button
          label="CONTINUE"
          variation="simple"
          customStyle={{ color: "#891AF8", borderColor: "#891AF8", marginTop: "1.5rem" }}
          onClick={() => openCheckoutScreen()}
        />
        </div>
      </YourBill>
    </PayErpInvoiceContainer>
  );
};
