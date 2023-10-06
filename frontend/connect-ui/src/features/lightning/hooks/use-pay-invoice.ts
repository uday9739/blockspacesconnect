import { useEffect, useState } from "react"
import { UseFormReturn } from "react-hook-form"
import { AmountReference } from "@blockspaces/shared/models/lightning/Invoice"
import { decode } from "@blockspaces/shared/validation/decorators"
import { IOption } from "@platform/common"
import { useUIStore } from "@ui"
import { useChannelReserve, useFetchConversion, useListQuickbooksAccounts, useNodeBalance, useNodeDoc } from "@lightning/queries"
import ApiResult from "@blockspaces/shared/models/ApiResult"
import { LightningNodeReference } from "@blockspaces/shared/models/lightning/Node"
import { NodeBalance } from "@blockspaces/shared/models/spaces/Lightning"
import { useCreatePurchase, usePayBolt11Invoice } from "@lightning/mutations"
import { useIsUserFeatureEnabled } from "@src/platform/hooks/user/queries"
import { FeatureFlags } from "@blockspaces/shared/models/feature-flags/FeatureFlags"

export type Invoice = {
  paymentHash: string
  memo: string
  fiatAmount: AmountReference
}

type PageData = {
  nodeDoc: ApiResult<LightningNodeReference>,
  nodeBalance: ApiResult<NodeBalance>,
  channelReserve: number | undefined,
  loadingData: boolean,
  error: any
}
const usePageData = (): PageData => {
  const { nodeDoc, nodeDocLoading, nodeDocError } = useNodeDoc()
  const { nodeBalance, balanceLoading, balanceError } = useNodeBalance()
  const { channelReserve, reserveLoading, reserveError } = useChannelReserve()

  return {
    nodeDoc,
    nodeBalance,
    channelReserve,
    loadingData: nodeDocLoading || balanceLoading || reserveLoading,
    error: nodeDocError || balanceError || reserveError
  }
}

export const usePayInvoice = (form: UseFormReturn<any, any>) => {
  const isUserFeatureEnabled = useIsUserFeatureEnabled();
  const isCyclrEnabled = isUserFeatureEnabled(FeatureFlags.cyclrUserBIP) === true;
  const UI = useUIStore()
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [invoice, setInvoice] = useState<Invoice>(null)
  const [expenseTypes, setExpenseTypes] = useState<IOption[]>([])
  const [defaultAccount, setDefaultAccount] = useState<IOption>({ label: '- Select Expense Category -', value: '' });
  const { nodeDoc, nodeBalance, channelReserve } = usePageData()

  const {
    price,
    btc,
    paymentHash,
    error: fetchConversionError,
    isFetching: fetchConversionIsLoading,
    refetch: refetchConversion
  } = useFetchConversion(form?.getValues('paymentInput') ? form?.getValues('paymentInput') : null, !form?.formState?.errors['paymentInput']?.message);
  const { data: quickbooksExpenseAccounts, error: quickbooksExpenseAccountsError, isLoading: quickbooksExpenseAccountsIsLoading } = useListQuickbooksAccounts('expense');
  const { mutateAsync: payBolt11InvoiceAsync } = usePayBolt11Invoice()
  const { mutateAsync: createPurchaseAsync } = useCreatePurchase();

  //handle getExpenseCategories
  useEffect(() => {
    if (quickbooksExpenseAccountsIsLoading || !quickbooksExpenseAccounts?.length || quickbooksExpenseAccounts?.length === undefined) return
    const options = quickbooksExpenseAccounts?.map((x): IOption => { return { label: x.name, value: x.id } });
    if (!options || options?.length === 0) return;
    setExpenseTypes(options);
  }, [quickbooksExpenseAccountsIsLoading]);

  // Handles price loading
  useEffect(() => {
    if (form.formState.errors['paymentInput'] || !form?.getValues('paymentInput')) return;
    if (!paymentHash) {
      form.setError('paymentInput', { message: 'PaymentHash is not present in invoice' });
    }
    if (!btc) {
      form.setError('paymentInput', { message: 'Amount not present in invoice' });
    }
    if (fetchConversionIsLoading === false) {
      refetchConversion();
    }
  }, [form.getValues('paymentInput'), form.formState.errors['paymentInput']]);

  // handle price change
  useEffect(() => {
    if (price && form?.getValues('paymentInput')) {
      const decodedInvoice = decode(form.getValues('paymentInput'))
      const sats = decodedInvoice.satoshis ? decodedInvoice.satoshis : null;
      const btc = sats ? (sats / 100_000_000).toFixed(8) : null;
      const descriptionTag = decodedInvoice.tags.find(x => x.tagName === 'description');
      const paymentHash = decodedInvoice.tags.find(x => x.tagName === 'payment_hash');
      const amount = price?.invoice?.find(x => x.currency.toUpperCase() === 'USD');
      setInvoice({
        memo: descriptionTag.data?.toString() || "Bitcoin Invoicing & Payments",
        paymentHash: paymentHash.data?.toString(),
        fiatAmount: {
          fiatValue: parseFloat((amount.amount as number).toFixed(2)),
          currency: amount.currency,
          btcValue: parseFloat(btc),
          exchangeRate: price.exchangeRate as any
        }
      });
    }
  }, [price]);

  const handleSuccess = async (message: string, end: boolean) => {
    if (end) form.resetField('paymentInput');
    UI.showToast({
      message: message,
      alertType: 'success',
      position: { vertical: 'top', horizontal: 'right' },
    });
    if (end) setSubmitting(false);
  };

  const handleFailure = (message: string) => {
    UI.showToast({
      message: `${message}`,
      alertType: 'error',
      position: { vertical: 'top', horizontal: 'right' },
    });
    form.resetField('paymentInput');
    form.resetField('expenseType');
    setSubmitting(false);
  }

  const payInvoice = async (payReq: string, expenseType: IOption) => {
    if (!nodeDoc?.data.apiEndpoint) {
      console.error('could not access node doc');
      return null;
    }
    const affectedBalance = Number(nodeBalance.data.local_balance.sat) - (invoice.fiatAmount.btcValue * 100_000_000)
    if (channelReserve === undefined || (channelReserve !== undefined && affectedBalance < channelReserve)) {
      const msg = channelReserve === undefined ? `Insufficient funds` : `Insufficient funds - your balance cannot drop below ${channelReserve.toLocaleString()} sats`;
      return UI.showToast({
        message: msg,
        alertType: 'error',
        position: { vertical: 'top', horizontal: 'right' },
      })
    }

    setSubmitting(true);

    const paymentResult = await payBolt11InvoiceAsync({ apiEndpoint: nodeDoc.data.apiEndpoint, payReq });

    if (!paymentResult.success) {
      form.reset();
      setSubmitting(false);
      return UI.showToast({
        message: paymentResult.message,
        alertType: 'error',
        position: { vertical: 'top', horizontal: 'right' },
      });
    }
    if (expenseType.value === '') handleSuccess(paymentResult.message, true);

    setSubmitting(false)
    form.resetField('paymentInput')

    if (!isCyclrEnabled && expenseType.value && paymentResult) {
      handleSuccess(`Payment successful! Posting to ERP...`, false);
      if (!expenseType?.value) {
        handleFailure(`Failed to post payment to ERP, cannot find expense category`);// ${expenseCategory}`)
        return;
      }
      try {
        await createPurchaseAsync({
          expenseCategoryId: expenseType.value,
          expenseCategoryName: expenseType.label,
          amount: invoice.fiatAmount.fiatValue,
          payment: paymentResult.payment
        })
        handleSuccess(`Payment posted to ERP!`, true);
      } catch (e) {
        handleFailure(`Posting to ERP failed: ${e.message}`);
      }
    }

  }



  return { fetchConversionIsLoading, fetchConversionError, submitting, invoice, setSubmitting, payInvoice, expenseTypes, defaultAccount };
}