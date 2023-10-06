import { useEffect } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { IsOptional, IsString } from "class-validator";
import { classValidatorResolver } from "@hookform/resolvers/class-validator";

import { PayDetails } from "./pay-details";
import { FormContainer, Row, FixedWidthFrame } from "./lightning-request.styles";

import { Button, TextInput, Select, IOption, Tooltip } from "@platform/common";
import { usePayInvoice } from "@lightning/hooks";
import { IsPaymentRequest } from "@blockspaces/shared/validation/decorators";
import { useIsUserFeatureEnabled } from "@src/platform/hooks/user/queries";
import { FeatureFlags } from "@blockspaces/shared/models/feature-flags/FeatureFlags";

class PaymentFormDto {
  @IsString()
  @IsPaymentRequest()
  paymentInput: string;

  @IsOptional()
  expenseType: IOption;
}

const resolver = classValidatorResolver(PaymentFormDto, {}, { mode: "async" });
export const LightningRequest = ({ /*submitting*/ /*setSubmitting*/ }) => {
  const enabled = useIsUserFeatureEnabled()
  const cyclrEnabled = enabled(FeatureFlags.cyclrUserBIP)

  const form = useForm<PaymentFormDto>({
    mode: "onChange",
    criteriaMode: "all",
    resolver: resolver
  });
  form.watch();

  const { fetchConversionIsLoading, submitting, invoice, payInvoice, expenseTypes, defaultAccount } = usePayInvoice(form);
  const handlePayment: SubmitHandler<PaymentFormDto> = () => {
    const payreq = form.getValues("paymentInput");
    //@ts-ignore
    const expenseType = form.getValues<IOption>("expenseType") ?? defaultAccount;
    payInvoice(payreq, expenseType);
  };

  useEffect(() => {
    if (!submitting) form.reset();
  }, [submitting]);

  return (
    <FormContainer onSubmit={form.handleSubmit(handlePayment)}>
      <Tooltip placement="right" content={`Paste a valid lightning invoice.`}>
        <TextInput
          register={form.register}
          width="30rem"
          style="lightningSetup"
          alignment="left"
          placeholder="lnbc..."
          name="paymentInput"
          label="LIGHTNING INVOICE"
          value={form.getValues("paymentInput")}
          error={!!form.formState.errors["paymentInput"]} // && form.getValues('paymentInput')?.length !== 0}
          errorMessage={form.formState.errors["paymentInput"]?.message}
        />
      </Tooltip>
      <Row gap="1rem">
        <FixedWidthFrame>
          <PayDetails
            loading={fetchConversionIsLoading}
            hide={!fetchConversionIsLoading && (!!form.formState.errors["paymentInput"] || (!form.getValues("paymentInput") && !form.formState.isValid))}
            amount={invoice?.fiatAmount}
            memo={invoice?.memo}
          />
        </FixedWidthFrame>
        <FixedWidthFrame>
          <Tooltip placement="right" content={"Please select the category of your purchase to report to Quickbooks."}>
            {!cyclrEnabled && expenseTypes.length > 0 ? (
              <Select
                label="QB - EXPENSE TYPE"
                name="expenseType"
                options={expenseTypes}
                selection={form.getValues("expenseType") ?? defaultAccount}
                onSelect={(option: IOption) => form.setValue("expenseType", option)}
                register={form.register}
                variation="default"
                size="lg"
              />
            ) : (
              <></>
            )}
          </Tooltip>
        </FixedWidthFrame>
      </Row>
      <Button
        id="btnSubmitPayment"
        label="Submit Payment"
        type="submit"
        variation="simple"
        width="25rem"
        disabled={!!form.formState.errors["paymentInput"] || (!form.getValues("paymentInput") && !form.formState.isValid)}
        submitting={submitting}
        labelOnSubmit={"Submitting Payment..."}
        customStyle={{ borderWidth: "2px" }}
      />
    </FormContainer>
  );
};
