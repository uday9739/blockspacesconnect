// import { observer } from "mobx-react-lite";
// import React, { useEffect, useState } from "react";
// import { useRouter } from "next/router";
// import { useUserStore, useDataStore } from "@platform/api";
// import { Button, TextInput } from "@platform/components/common";
// import { BillingAddressDto } from "@blockspaces/shared/dtos/cart";
// import { SubmitHandler, useForm } from "react-hook-form";
// import { classValidatorResolver } from "@hookform/resolvers/class-validator";
// import { CartStatus } from "@blockspaces/shared/models/cart";
// import { CardElement, Elements, useStripe, useElements } from "@stripe/react-stripe-js";
// import { loadStripe, StripeCardElement } from "@stripe/stripe-js";
// import { StepperContext, StepperStore, Stepper } from "@platform/components/common";
// import { NetworkPriceDto } from "@blockspaces/shared/dtos/network-catalog/NetworkPrice";
// import { Error, Container, StepWrapper, BillingForm, CheckoutWrapper, Card, CardTitle, CardForm, CardPrice, CardBody, CardFooter } from "./cart.styles";
// import { NetworkStyles } from "../../networks/network/styles/network.styles";

// const OfferingLineItem = (props: NetworkPriceDto) => {
//   const isMetered = props.isMetered;
//   const displayName = props.displayName;
//   let priceStr = "";

//   if (isMetered && props.tiers && props.tiers.length > 0) {
//     return (
//       <>
//         {displayName} <a href="javascript:void(0)">Tiered</a>
//       </>
//     );
//   } else if (isMetered === true) {
//     priceStr = "$" + props.unitAmount;
//   }

//   return <>{displayName}</>;
// };

// const CheckoutForm = ({ cartSessionId, secret, amountDue, billingInfo, setError, overrideIsSubmitting = false, overrideIsDisabled = false }) => {
//   let cardElement: StripeCardElement = null;
//   const cardStyles = {
//     style: {
//       base: {
//         iconColor: "black",
//         color: "black",
//         fontWeight: 500,
//         fontSize: "22px",

//         ":-webkit-autofill": {
//           color: "black"
//         },
//         "::placeholder": {
//           color: "#black"
//         }
//       },
//       invalid: {
//         iconColor: "#721c24",
//         color: "#721c24"
//       }
//     }
//   };

//   const stripe = useStripe();
//   const elements = useElements();
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [isFormComplete, setIsFormComplete] = useState(false);
//   const { cartStore } = useDataStore();

//   useEffect(() => {
//     window.onbeforeunload = function (event) {
//       event.preventDefault();
//       return isSubmitting || overrideIsSubmitting ? "Please wait until payment is done processing" : null;
//     };

//     if (elements && !cardElement) {
//       cardElement = elements.getElement(CardElement);
//       cardElement.on("change", (data) => {
//         setIsFormComplete(data.complete);
//         setError && setError(data.error?.message);
//       });
//     }
//   }, [elements]);

//   useEffect(() => {
//     return () => {
//       console.log("cleaned up");
//       window.onbeforeunload = null;
//     };
//   }, []);

//   const handleSubmit = async (event) => {
//     event.preventDefault();
//     if (!stripe || !elements) {
//       // Stripe.js has not yet loaded.
//       // Make sure to disable form submission until Stripe.js has loaded.
//       return;
//     }

//     try {
//       setIsSubmitting(true);
//       // clear errors
//       setError && setError(null);

//       cartStore.markCartPendingPayment();

//       let { error, paymentIntent } = await stripe.confirmCardPayment(secret, {
//         //`Elements` instance that was used to create the Payment Element
//         payment_method: {
//           card: elements.getElement(CardElement),
//           billing_details: {
//             name: billingInfo?.fullName
//           }
//         }
//       });

//       setIsSubmitting(false);

//       if (error) {
//         console.log(error);
//         setError && setError(error.message);
//       } else {
//         // success
//         console.log(paymentIntent);
//       }
//     } catch (error) {
//       console.log(error);
//       setIsSubmitting(false);
//       setError && setError(error.message);
//     }
//   };

//   return (
//     <CardForm onSubmit={handleSubmit}>
//       <CardElement
//         options={{
//           disabled: overrideIsSubmitting || overrideIsDisabled,
//           iconStyle: "solid",
//           style: cardStyles.style,
//           value: { postalCode: billingInfo?.postalCode }
//         }}
//       />
//       <Button
//         type="submit"
//         label={`Pay $${amountDue.toFixed(2)}`}
//         labelOnSubmit="Processing"
//         disabled={!stripe || !isFormComplete || overrideIsDisabled}
//         submitting={overrideIsSubmitting || isSubmitting}
//         customStyle={{ marginLeft: "auto", marginRight: "auto", marginTop: "25px" }}
//       />
//     </CardForm>
//   );
// };

// const Cart = observer(() => {
//   //#region Store Management & Local Variables
//   const userStore = useUserStore();
//   const { user } = userStore;
//   const {
//     cartStore,
//     cartStore: {
//       cartSession,
//       paymentConfig,
//       priceCatalog,
//       initializingCartSession,
//       cartErrorMsg,
//       isPendingPaymentProcessing,
//       isCheckoutComplete,
//       isCartEmpty,
//       isBillingInfoLoading,
//       networkName,
//       isConfirmingNewItemsLoading
//     }
//   } = useDataStore();
//   const router = useRouter();
//   const billingForm = useForm<BillingAddressDto>({
//     mode: "onTouched",
//     criteriaMode: "all",
//     resolver: classValidatorResolver(BillingAddressDto)
//   });
//   const stepperConfig = {
//     id: 1,
//     currentStepIndex: 1,
//     header: "",
//     steps: [
//       { id: 1, header: "", content: <></> },
//       { id: 2, header: "", content: <></> },
//       { id: 3, header: "", content: <></> }
//     ]
//   };
//   let stripePromise = null;
//   //#endregion

//   //#region State & Effects Management
//   const [redirectCountDown, setRedirectCountDown] = useState(5);
//   const [stepperStore, setStepperStore] = useState(new StepperStore({ id: stepperConfig.id, header: stepperConfig.header, steps: stepperConfig.steps }));
//   const [stripeError, setStripeError] = useState<String>();
//   useEffect(() => {
//     stepperStore.canGoToStep = _canGoToStep;

//     if (stepperStore.currentStepId !== _getCurrentCartStep()) stepperStore.goToStepId(_getCurrentCartStep());

//     if (cartSession?.status === CartStatus.ERROR_GATEWAY_ERROR) {
//       if (!stripeError) {
//         setStripeError(`Latest error: ${cartSession.cartError?.message}`);
//       }
//     }

//     if (cartSession?.status === CartStatus.CHECKOUT_COMPLETE) {
//       const interval = setInterval(() => {
//         setRedirectCountDown((redirectCountDown) => (redirectCountDown !== 0 ? redirectCountDown - 1 : 0));
//       }, 1000);

//       return () => clearInterval(interval);
//     }

//     if (cartSession?.status === CartStatus.PENDING_BILLING_INFO) {
//       billingForm.watch();
//     }
//     if (billingForm.formState.isDirty === false && cartSession?.billingAddress) {
//       billingForm.setValue("fullName", cartSession.billingAddress.fullName);
//       billingForm.setValue("addressLine1", cartSession.billingAddress.addressLine1);
//       billingForm.setValue("addressLine2", cartSession.billingAddress.addressLine2);
//       billingForm.setValue("city", cartSession.billingAddress.city);
//       billingForm.setValue("postalCode", cartSession.billingAddress.postalCode);
//       billingForm.setValue("country", cartSession.billingAddress.country);
//       billingForm.setValue("state", cartSession.billingAddress.state);
//     }
//   }, [initializingCartSession, cartSession]);

//   useEffect(() => {
//     if (redirectCountDown === 0) {
//       userStore.refreshUser(); // this ensures user networks list is updated
//       router.push(`/connect`);
//       // router.push(`/connect/${cartSession.networkId}`);
//     }
//   }, [redirectCountDown]);

//   //#endregion

//   //#region Helper Methods
//   const _haveError = (): boolean => {
//     return cartErrorMsg != null || stripeError != null;
//   };

//   const _getErrorMsg = (): string => {
//     return `${cartErrorMsg ? cartErrorMsg : ""} \n ${stripeError ? stripeError : ""}`;
//   };

//   const _getCurrentCartStep = () => {
//     let step = 1;
//     switch (cartSession?.status) {
//       case CartStatus.EMPTY: {
//         step = 1;
//         break;
//       }
//       case CartStatus.PENDING_BILLING_INFO:
//       case CartStatus.PENDING_NEW_ADDITION_CONFIRMATION: {
//         step = 2;
//         break;
//       }
//       case CartStatus.CHECKOUT_COMPLETE:
//       case CartStatus.ERROR_GATEWAY_ERROR:
//       case CartStatus.PENDING_PROCESSING_PAYMENT:
//       case CartStatus.PENDING_CC_INFO: {
//         step = 3;
//         break;
//       }

//       default: {
//         step = 1;
//       }
//     }

//     return step;
//   };

//   const _getStepperCurrentStep = () => {
//     return stepperStore.currentStepId;
//   };

//   const _isPendingPaymentProcessing = () => {
//     return isPendingPaymentProcessing;
//   };

//   const _isCheckoutComplete = () => {
//     return isCheckoutComplete;
//   };

//   const _havePaymentError = () => {
//     switch (cartSession?.status) {
//       case CartStatus.ERROR_GATEWAY_ERROR: {
//         return true;
//       }
//     }
//     return false;
//   };

//   const _getOfferingTotalFormattedFiatPrice = (offering) => {
//     const recurrence = offering?.recurrence.charAt(0).toUpperCase() + offering?.recurrence.slice(1);
//     return `${_getFormattedFiatPrice(offering.items.filter((x) => !x.isMetered).reduce((total, item) => total + item?.unitAmount, 0))} /${recurrence}`;
//   };

//   const _getFormattedFiatPrice = (num: number) => {
//     return `$${num.toFixed(2)}`;
//   };

//   const _getStripeClientSecret = () => {
//     return paymentConfig?.paymentToken;
//   };

//   const _getAmountDue = () => {
//     return paymentConfig?.amountDue;
//   };

//   const _getStripePromiseHelper = () => {
//     if (!stripePromise) {
//       stripePromise = loadStripe(paymentConfig.key);
//     }
//     return stripePromise;
//   };

//   const _canGoToStep = (stepNum) => {
//     if ((_isPendingPaymentProcessing() || _havePaymentError() || _isCheckoutComplete()) && stepNum !== 3) return false;
//     return stepNum <= _getCurrentCartStep();
//   };

//   const _setCheckoutError = (error) => {
//     setStripeError(error);
//   };

//   const _isOfferingSelected = (offering) => {
//     return cartSession?.items?.find((x) => x.offerId === offering?.id) != null;
//   };
//   //#endregion

//   //#region Action Methods
//   const _selectOffer = async (offering) => {
//     setStripeError(null);
//     cartStore.clearErrorMsg();
//     if (_isOfferingSelected(offering) && isCartEmpty === false) {
//       stepperStore.goToStepId(2);
//     } else {
//       await cartStore.selectOffering(offering);
//     }
//   };

//   const _submitBillingInfo: SubmitHandler<any> = async (data) => {
//     setStripeError(null);
//     cartStore.clearErrorMsg();
//     if (_getCurrentCartStep() > 2 && billingForm.formState.isDirty === false) {
//       return stepperStore.goToStepId(3);
//     }
//     await cartStore.submitBillingInfo(data);
//   };

//   const _confirmNewSubscriptionItems = async () => {
//     cartStore.clearErrorMsg();
//     await cartStore.confirmCartPendingItems();
//   };

//   //#endregion

//   //#region render
//   if (!initializingCartSession && !cartSession && !_haveError()) return <></>;
//   if (initializingCartSession)
//     return (
//       <NetworkStyles>
//         <Container>Loading...</Container>
//       </NetworkStyles>
//     );

//   return (
//     <NetworkStyles>
//       <Container>
//         {/* Stepper */}
//         <StepWrapper>
//           <StepperContext.Provider value={stepperStore}>
//             <Stepper id={stepperConfig.id} steps={stepperConfig.steps}>
//               <Stepper.Progress>
//                 {stepperConfig.steps.map((item) => (
//                   <Stepper.Stage key={item.id} id={item.id as number} />
//                 ))}
//               </Stepper.Progress>
//             </Stepper>
//           </StepperContext.Provider>
//         </StepWrapper>

//         {/* Errors */}
//         {_haveError() === true && (
//           <>
//             <Error>{_getErrorMsg()}</Error>
//           </>
//         )}

//         {/* Step:1 EMPTY CART */}
//         {_getStepperCurrentStep() === 1 && (
//           <div>
//             {priceCatalog.map((offering, index) => {
//               const nonMeteredItems = offering.items.filter((o) => o.isMetered === false);
//               const meteredItems = offering.items.filter((o) => o.isMetered === true);
//               return (
//                 <Card key={index} selected={_isOfferingSelected(offering)}>
//                   <CardTitle>
//                     <h2> {offering.title}</h2>
//                   </CardTitle>
//                   <CardPrice>{_getOfferingTotalFormattedFiatPrice(offering)}</CardPrice>
//                   <CardBody>
//                     <p style={{ padding: "0px 10px 0px 10px", textAlign: "center" }}>{offering.description}</p>
//                     <small>Included</small>
//                     <ul style={{ fontSize: "14px", alignSelf: "baseline" }}>
//                       {nonMeteredItems.map((item, index) => {
//                         return (
//                           <li key={index}>
//                             <OfferingLineItem {...item} />
//                           </li>
//                         );
//                       })}
//                     </ul>
//                     <small>Usage Based</small>
//                     <ul style={{ fontSize: "14px", alignSelf: "baseline" }}>
//                       {meteredItems.map((item, index) => {
//                         return (
//                           <li key={index}>
//                             <OfferingLineItem {...item} />
//                           </li>
//                         );
//                       })}
//                     </ul>
//                   </CardBody>
//                   <CardFooter>
//                     <Button
//                       type="button"
//                       label="Select"
//                       labelOnSubmit="Submitting"
//                       submitting={false}
//                       width="13rem"
//                       height="2.5rem"
//                       customStyle={{
//                         borderWidth: "1px",
//                         fontSize: ".8125rem"
//                       }}
//                       onClick={() => _selectOffer(offering)}
//                     />
//                   </CardFooter>
//                 </Card>
//               );
//             })}
//           </div>
//         )}

//         {/* Step 2 */}
//         {_getStepperCurrentStep() === 2 && (
//           <StepWrapper style={{ marginTop: "15px" }}>
//             {/* PENDING_BILLING_INFO */}
//             {cartSession?.status === CartStatus.PENDING_BILLING_INFO && (
//               <div style={{ margin: "auto" }}>
//                 <h1 style={{ textAlign: "center" }}>Billing Information</h1>
//                 <BillingForm onSubmit={billingForm.handleSubmit(_submitBillingInfo)}>
//                   <TextInput
//                     register={billingForm.register}
//                     margin="2rem auto 0"
//                     width="26rem"
//                     alignment="left"
//                     name="fullName"
//                     label="Full Name"
//                     type="text"
//                     value={billingForm.getValues("fullName")}
//                   />
//                   <TextInput
//                     register={billingForm.register}
//                     margin="2rem auto 0"
//                     width="26rem"
//                     alignment="left"
//                     name="addressLine1"
//                     label="Address Line 1"
//                     type="text"
//                     value={billingForm.getValues("addressLine1")}
//                   />
//                   <TextInput
//                     register={billingForm.register}
//                     margin="2rem auto 0"
//                     width="26rem"
//                     alignment="left"
//                     name="addressLine2"
//                     label="Address Line 2"
//                     type="text"
//                     value={billingForm.getValues("addressLine2")}
//                   />
//                   <TextInput register={billingForm.register} margin="2rem auto 0" width="26rem" alignment="left" name="city" label="City" type="text" value={billingForm.getValues("city")} />
//                   <TextInput register={billingForm.register} margin="2rem auto 0" width="26rem" alignment="left" name="country" label="Country" type="text" value={billingForm.getValues("country")} />
//                   <TextInput
//                     register={billingForm.register}
//                     margin="2rem auto 0"
//                     width="26rem"
//                     alignment="left"
//                     name="postalCode"
//                     label="Postal Code"
//                     type="text"
//                     value={billingForm.getValues("postalCode")}
//                   />
//                   <TextInput register={billingForm.register} margin="2rem auto 0" width="26rem" alignment="left" name="state" label="State" type="text" value={billingForm.getValues("state")} />
//                   <Button
//                     type="submit"
//                     label="Submit"
//                     labelOnSubmit="Submitting"
//                     submitting={isBillingInfoLoading}
//                     customStyle={{
//                       marginBottom: "1.25rem",
//                       borderWidth: "1px",
//                       fontSize: ".8125rem"
//                     }}
//                   />
//                 </BillingForm>
//               </div>
//             )}
//             {/* PENDING_NEW_ADDITION_CONFIRMATION */}
//             {cartSession?.status === CartStatus.PENDING_NEW_ADDITION_CONFIRMATION && (
//               <div style={{ margin: "auto", display: "flex", flexDirection: "column", alignItems: "center" }}>
//                 <p style={{ textAlign: "center" }}>
//                   {" "}
//                   The following service for <b>{networkName}</b> will be added to your existing subscription
//                   {paymentConfig?.amountDue > 0 ? (
//                     <>
//                       , with a prorated amount of <b>{_getFormattedFiatPrice(paymentConfig?.amountDue)}</b> for the current billing cycle.
//                     </>
//                   ) : (
//                     <>.</>
//                   )}
//                   <br />
//                   Please confirm below
//                 </p>
//                 {priceCatalog
//                   .filter((offering) => _isOfferingSelected(offering))
//                   .map((offering, index) => {
//                     const nonMeteredItems = offering.items.filter((o) => o.isMetered === false);
//                     const meteredItems = offering.items.filter((o) => o.isMetered === true);
//                     return (
//                       <Card key={index} selected>
//                         <CardTitle>
//                           <h2> {offering.title}</h2>
//                         </CardTitle>
//                         <CardPrice>{_getOfferingTotalFormattedFiatPrice(offering)}</CardPrice>
//                         <CardBody>
//                           <p style={{ padding: "0px 10px 0px 10px", textAlign: "center" }}>{offering.description}</p>
//                           <small>Included</small>
//                           <ul style={{ fontSize: "14px", alignSelf: "baseline" }}>
//                             {nonMeteredItems.map((item, index) => {
//                               return (
//                                 <li key={index}>
//                                   <OfferingLineItem {...item} />
//                                 </li>
//                               );
//                             })}
//                           </ul>
//                           <small>Usage Based</small>
//                           <ul style={{ fontSize: "14px", alignSelf: "baseline" }}>
//                             {meteredItems.map((item, index) => {
//                               return (
//                                 <li key={index}>
//                                   <OfferingLineItem {...item} />
//                                 </li>
//                               );
//                             })}
//                           </ul>
//                         </CardBody>
//                         <CardFooter></CardFooter>
//                       </Card>
//                     );
//                   })}
//                 <Button
//                   type="button"
//                   label="Confirm"
//                   labelOnSubmit="Submitting"
//                   onClick={_confirmNewSubscriptionItems}
//                   submitting={isConfirmingNewItemsLoading}
//                   customStyle={{
//                     marginTop: "1.25rem",
//                     marginLeft: "auto",
//                     marginRight: "auto",
//                     borderWidth: "1px",
//                     fontSize: ".8125rem"
//                   }}
//                 />
//               </div>
//             )}
//           </StepWrapper>
//         )}

//         {/* Step 3 */}
//         {_getStepperCurrentStep() === 3 && (
//           <CheckoutWrapper>
//             {/* CC Processing */}
//             {_isCheckoutComplete() === false && (
//               <>
//                 <Elements stripe={_getStripePromiseHelper()}>
//                   <CheckoutForm
//                     cartSessionId={cartSession?.id}
//                     overrideIsSubmitting={_isPendingPaymentProcessing()}
//                     overrideIsDisabled={_isCheckoutComplete()}
//                     secret={_getStripeClientSecret()}
//                     billingInfo={cartSession?.billingAddress}
//                     amountDue={_getAmountDue()}
//                     setError={_setCheckoutError}
//                   />
//                   <div>
//                     {paymentConfig?.couponApplied && paymentConfig?.discountTotal > 0 && (
//                       <>
//                         <small>
//                           <i>
//                             * Coupon for <b>{_getFormattedFiatPrice(paymentConfig.discountTotal)}</b> has been automatically applied
//                           </i>{" "}
//                         </small>
//                       </>
//                     )}
//                   </div>
//                 </Elements>
//               </>
//             )}

//             {/* _isCheckoutComplete */}
//             {_isCheckoutComplete() === true && (
//               <>
//                 <h3>Thank you for your order.</h3>
//                 <br />

//                 {redirectCountDown !== 0 && <>Redirecting to my networks in {redirectCountDown}</>}
//                 {redirectCountDown === 0 && <>Redirecting...</>}
//               </>
//             )}
//           </CheckoutWrapper>
//         )}
//       </Container>
//     </NetworkStyles>
//   );
//   //#endregion
// });

// export default Cart;
