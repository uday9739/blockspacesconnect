import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

import { CancelButton, CheckoutAmount, CheckoutFiat, CheckoutModal, CheckoutSats, CheckoutTitle } from "./checkout.styles";

import { InvoiceReference, OnchainInvoice, OnchainQuote, PaymentSource, PaymentType, QuoteReference } from "@blockspaces/shared/models/lightning/Invoice";
import { Loading, CopyText } from "@platform/common";
import { useCheckout, getCheckoutReturnQuery, getPaidReturnQuery } from "@lightning/hooks";
import { useUIStore } from "@ui";
import { Satoshi, Cancel } from "@icons";
import { ErpMetadata } from "@blockspaces/shared/models/lightning/Integration";
import { Tab, Tabs } from "@mui/material";

interface CheckoutProps {
  type: PaymentType;
  erpMetadata?: ErpMetadata[];
  qbId?: string;
}
export const Checkout = ({ type }: CheckoutProps) => {
  const router = useRouter();
  const UI = useUIStore();
  const { amount, tenantId, erpId, source, erpMetadata } = router.query;
  const { getInvoice, invoice, lightningQuote, onchainQuote, paid } = useCheckout(source as PaymentSource);

  const cancelInvoice = () => {
    router.replace({ pathname: router.pathname, query: getCheckoutReturnQuery(router.query) });
    return UI.showToast({
      message: `Transaction for $${amount} cancelled.`,
      alertType: "error",
      position: {
        horizontal: "right",
        vertical: "top"
      },
      autoHideDuration: 5000
    });
  };

  useEffect(() => {
    if (!router.isReady) return; 
    getInvoice(Number(amount), tenantId as string, erpId as string, erpMetadata ? JSON.parse(erpMetadata as string) : [], source as PaymentSource);
  }, [router.isReady]);

  useEffect(() => {
    if (!paid) return;
    router.replace({ pathname: router.pathname, query: getPaidReturnQuery(router.query) });
  }, [paid]);

  const [value, setValue] = useState(0)
  const handleChange = (evet: React.SyntheticEvent, newValue: number) => {
    setValue(newValue)
  }
  return (
    <CheckoutModal id="checkout-modal">
      <Loading maxWidth="285px" maxHeight="285px" when={!lightningQuote}>
        <Tabs value={value} onChange={handleChange}>
          <Tab label="Lightning" tabIndex={0}/>
          <Tab label="On Chain" tabIndex={1}/>
        </Tabs>
        <CancelButton id="btnCancelInvoice" onClick={() => cancelInvoice()}>
          <Cancel />
        </CancelButton>
        {/** Lightning */}
        <ScanToPay lightningQuote={lightningQuote} lightningInvoice={invoice?.offchain} value={value} index={0}/>
        {/** On-Chain */}
        <ScanToPay onchainQuote={onchainQuote} onchainInvoice={invoice?.onchain} value={value} index={1}/> 
      </Loading>
    </CheckoutModal>
  );
};

type ScanToPayProps = {
  lightningQuote?: QuoteReference,
  onchainQuote?: OnchainQuote,
  lightningInvoice?: InvoiceReference,
  onchainInvoice?: OnchainInvoice,
  value: number
  index: number
}
const ScanToPay = (props: ScanToPayProps) => {
  const {lightningQuote, lightningInvoice, onchainQuote, onchainInvoice, value, index} = props

  const address = index === 0 ? lightningQuote.paymentRequest : onchainQuote.uri
  const quote = index === 0 ? lightningQuote : onchainQuote
  const invoice = index === 0 ? lightningInvoice : onchainInvoice

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`scan-to-pay-${index}`}
      aria-labelledby={`scan-to-pay--${index}`}
    >
    <div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
    <CheckoutTitle>SCAN TO PAY</CheckoutTitle>
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingBottom: "2rem" }}>
      <QRCodeSVG
        value={address}
        size={285}
        style={{ padding: ".25rem", marginBottom: "1rem" }}
        imageSettings={{ src: "/images/lightning/lightning-qr-logo.png", height: 35, width: 35, excavate: true }}
      />
      <CopyText label="Payment Request" text={address} style={{ width: "18rem", height: "2.5rem" }} />
    </div>
    <CheckoutAmount>
      {/* <Rectangle /> */}
      <CheckoutFiat>${invoice && invoice.amount.fiatValue.toFixed(2)}</CheckoutFiat>
      <CheckoutSats>
        <Satoshi style={{ margin: ".5rem .25rem" }} color="#B3B3B3" />
        {quote && (quote.amount.btcValue * 100_000_000).toLocaleString()}
      </CheckoutSats>
    </CheckoutAmount>
    </div>
    </div>
  )
}

// const Rectangle = () => {
//   return (
//     <svg style={{ position: "relative", left: "-10.5rem", top: "-.975rem" }} width="34.853125rem" height="4rem" viewBox="0 0 585 64" fill="none" xmlns="http://www.w3.org/2000/svg">
//       <path
//         d="M0.493153 63.0026L151.681 63.0026C155.946 63.0026 159.901 60.7454 162.434 57.3139C173.811 41.9033 210.755 0.500525 279.296 0.500537C347.837 0.500549 384.781 41.9034 396.158 57.314C398.691 60.7454 402.646 63.0026 406.911 63.0026L558.139 63.0026"
//         stroke="#F1F3FF"
//       />
//     </svg>
//   );
// };
