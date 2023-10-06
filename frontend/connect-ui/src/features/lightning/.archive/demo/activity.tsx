import React, { useRef, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import Modal from '@mui/material/Modal';
import { observer } from 'mobx-react-lite';
import { ObservableLightningNetwork } from 'src/features/lightning/api';
import { PayInvoice } from '@blockspaces/shared/models/spaces/Lightning';

import Activity, {
  SectionTitle, WalletBalance, Label, Quantity, ConversionAmt, WalletActions, Action, SendInvoice, Transactions,
  ModalBody, ModalTitle, ModalInputWrap, ModalInputLabel, ModalForm, ModalSubmit, ModalInput, ModalInputCurrency, ModalInputConversionAmt, QRCodeCopy, QRCodeConfirm,
} from './styles/activity';
import Invoices from './invoices';

type Props = {
  node: ObservableLightningNetwork,
}

interface ReceiveFormProps {
  amount: number;
  memo: string
}

interface SendFormProps {
  pay_req: string,
}

const ACTIVITY = observer(({ node }: Props) => {
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [receive, setReceive] = useState<boolean>(false);
  const [invoice, setInvoice] = useState<string>("");
  const handleOpenReceive = () => setReceive(true);
  const [copiedInvoice, setCopiedInvoice] = useState(false);

  const [send, setSend] = useState(false);
  const [sendStatus, setSendStatus] = useState<PayInvoice>({ status: "", message: "" });
  const handleOpenSend = () => setSend(true);

  function ReceiveModal() {
    const handleCloseReceive = () => {
      setReceive(false);
      setInvoice("");
    };
    const receiveForm = useForm<ReceiveFormProps>({
      mode: "onTouched",
      defaultValues: {}
    });
    receiveForm.watch();
    const submitReceive: SubmitHandler<ReceiveFormProps> = async (receiveData) => {
      setSubmitting(true);
      // const data = await postCreateInvoice(receiveData.amount, receiveData.memo);
      // setInvoice(data.payment_request);
      setSubmitting(false);
    };
    return (
      <Modal open={receive} onClose={handleCloseReceive} aria-labelledby="create-lightning-invoice" aria-describedby="Create a Lightning Invoice">
        <ModalBody>
          {!invoice ? (
            <>
              <ModalTitle>Create Invoice</ModalTitle>
              <ModalForm onSubmit={receiveForm.handleSubmit(submitReceive)}>
                <ModalInputWrap>
                  <ModalInputLabel data-visible={!!receiveForm.getValues("amount")}>AMOUNT</ModalInputLabel>
                  <ModalInput {...receiveForm.register("amount")} placeholder="AMOUNT" autoComplete="off" />
                  <ModalInputCurrency>SATS</ModalInputCurrency>
                  <ModalInputConversionAmt data-visible={!!receiveForm.getValues("amount")}>
                    ~$
                    {Intl.NumberFormat("en-US").format((receiveForm.getValues("amount") / 100000000) * 43902)}
                  </ModalInputConversionAmt>
                </ModalInputWrap>
                <ModalInputWrap>
                  <ModalInputLabel data-visible={!!receiveForm.getValues("memo")}>DESCRIPTION</ModalInputLabel>
                  <ModalInput {...receiveForm.register("memo")} placeholder="DESCRIPTION" autoComplete="off" />
                </ModalInputWrap>
                <ModalSubmit type="submit" disabled={!receiveForm.getValues("amount") || submitting}>
                  {submitting ? "CREATING..." : "CREATE INVOICE"}
                </ModalSubmit>
              </ModalForm>
            </>
          ) : (
            <>
              <ModalTitle style={{ marginBottom: "2rem" }}>Copy Invoice</ModalTitle>
              {/* <QRCode size={356} bgColor='#180931' fgColor='#FFFFFF' value={invoice} /> */}
              <QRCodeConfirm data-visible={copiedInvoice}>Invoice Copied to Clipboard!</QRCodeConfirm>
              <QRCodeCopy
                onClick={() => {
                  navigator.clipboard.writeText(invoice);
                  setCopiedInvoice(true);
                  setTimeout(() => setCopiedInvoice(false), 2000);
                }}
              >
                <span>{invoice}</span>
              </QRCodeCopy>
            </>
          )}
        </ModalBody>
        {/* <Box sx={{position: "absolute", top: "40%", left: "40%", width: "400px", backgroundColor: "#1E0F37", border: "1px solid #7B1AF7", borderRadius: "10px", boxShadow: "1px 1px 10px #7B1AF7", padding: "3rem"}}>
            <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center">
              {invoice == "" ?
                <>
                  <h3 style={{color: "#FFFFFF", paddingBottom: "10px"}}>Create Invoice</h3>
                  <form onSubmit={receiveForm.handleSubmit(submitReceive)}>
                    <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" color="#FFFFFF">
                      <Box marginBottom="1rem">
                        <p style={{marginBottom: ".5rem"}}>Amount</p>
                        <input {...receiveForm.register("amount")} placeholder="0 sats" autoComplete='off' />
                      </Box>
                      <Box>
                        <p style={{marginBottom: ".5rem"}}>Description</p>
                        <input {...receiveForm.register("memo")} placeholder="Description" autoComplete='off' />
                      </Box>
                    </Box>
                    <Box textAlign="center" marginTop="1rem">
                      <SendInvoice data-submitting={submitting} type='submit' disabled={submitting}>Create Invoice</SendInvoice>
                    </Box>
                  </form>
                </>
                :
                <>
                  {submitting ?
                    <h3>Loading...</h3>
                    :
                    <>
                      <QRCode bgColor='#1E0F37' fgColor='#FFFFFF' value={invoice} />
                      <Box sx={{ border: 1, borderColor: "#FFFFFF", padding: "5px", borderRadius: "10px", marginTop: "1rem"}}>
                        <p style={{whiteSpace: "nowrap", overflow: "scroll", fontSize: ".75rem", width: "300px", color: "#FFFFFF", fontWeight: "lighter"}} onClick={() => {navigator.clipboard.writeText(invoice); alert("Invoice copied to clipboard."); setInvoice("")}}>{invoice}...</p>
                      </Box>
                    </>
                  }
                </>
              }
            </Box>
          </Box> */}
      </Modal>
    );
  }

  function SendModal() {
    const handleCloseSend = () => {
      setSend(false);
      setSendStatus({ status: "", message: "" });
    };
    const sendForm = useForm<SendFormProps>({
      mode: "onTouched",
      defaultValues: { pay_req: "" }
    });
    sendForm.watch();
    const submitSend = async (sendData) => {
      setSubmitting(true);
      // const data = await putPayInvoice(sendData.pay_req, 3600);
      // setSendStatus(data);
      setSubmitting(false);
    };

    return (
      <Modal open={send} onClose={handleCloseSend} aria-labelledby="pay-lightning-invoice" aria-describedby="Pay a Lightning Invoice">
        <ModalBody>
          <ModalTitle>Pay Invoice</ModalTitle>
          <ModalForm onSubmit={sendForm.handleSubmit(submitSend)}>
            <ModalInputWrap>
              <ModalInputLabel data-visible={!!sendForm.getValues("pay_req")}>INVOICE</ModalInputLabel>
              <ModalInput {...sendForm.register("pay_req")} placeholder="INVOICE" autoComplete="off" />
            </ModalInputWrap>
            <ModalSubmit type="submit" disabled={!sendForm.getValues("pay_req") || submitting}>
              {submitting ? "SUBMITTING" : "SEND PAYMENT"}
            </ModalSubmit>
          </ModalForm>
        </ModalBody>
      </Modal>
    );
  }
  // @ts-ignore
  const openInvoices = node.incomingPayments.invoices.filter((tx) => tx.settled == false && Number(tx.creation_date) + Number(tx.expiry) >= Math.round(Date.now() / 1000)).reverse();
  // @ts-ignore
  const closedInvoices = node.incomingPayments.invoices.filter((tx) => tx.settled == false && Number(tx.creation_date) + Number(tx.expiry) < Math.round(Date.now() / 1000)).reverse();
  // @ts-ignore
  const settledInvoices = node.incomingPayments.invoices.filter((tx) => tx.settled == true).reverse();

  const invoices = {
    open: openInvoices,
    settled: settledInvoices,
    closed: closedInvoices
  };

  return (
    <Activity>
      <SectionTitle>LIGHTNING WALLET</SectionTitle>
      <WalletBalance>
        <Label>BALANCE</Label>
        <Quantity>
          <span className="fak fa-satoshisymbol-solidtilt" />
          {Intl.NumberFormat("en-US").format(node.nodeBalance.balance)}
        </Quantity>
        <ConversionAmt>
          ~$
          {Intl.NumberFormat("en-US").format(Math.floor((node.nodeBalance.balance / 100000000) * 43902))}
        </ConversionAmt>
      </WalletBalance>
      <WalletActions>
        <Action onClick={handleOpenSend}>SEND</Action>
        <Action onClick={handleOpenReceive}>RECEIVE</Action>
      </WalletActions>
      <Transactions>
        <Invoices invoices={invoices} />
      </Transactions>
      <ReceiveModal />
      <SendModal />
    </Activity>
  );
});

export default ACTIVITY;
