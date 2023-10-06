import { Box, Button, Chip, Grid, Tooltip, Typography } from "@mui/material";
import { Loading } from "@src/platform/components/common";
import { useEffect, useMemo, useState } from "react";
import styled, { useTheme } from "styled-components";
import { BillingSection, BillingSectionBody, BillingSectionHeader, BillingSectionTitle, PillContainer } from "./billing-section";
import { useGetPaymentMethods } from "../hooks/queries";
import { ConnectSubscriptionExpandedDto } from "@blockspaces/shared/dtos/connect-subscription/ConnectSubscriptionDto";
import { ConnectSubscriptionStatus } from "@blockspaces/shared/models/connect-subscription/ConnectSubscription";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import { capitalizeFirstLetter, monthToPaddedString } from "../utils";
import VisaIcon from "@src/platform/components/icons/Visa";
import MastercardIcon from "@src/platform/components/icons/Mastercard";
import DiscoverIcon from "@src/platform/components/icons/DiscoverCard";
import AmexIcon from "@src/platform/components/icons/Amex";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import { useDeletePaymentMethod, useSetDefaultPaymentMethod } from "../hooks/mutations";
import CircularProgress from "@mui/material/CircularProgress";
import ConfirmDialog from "@src/platform/components/dialogs/ConfirmDialog";
import { useUIStore } from "@src/providers";
import { useRouter } from "next/router";
import { modalRoutes } from "@src/platform/routes/modals/index.controller";
import Link from "next/link";
enum PaymentMethodActions {
  SetAsDefault,
  Delete
}
type PaymentMethodsProps = { connectSubscription: ConnectSubscriptionExpandedDto };
export const PaymentMethods = ({ connectSubscription }: PaymentMethodsProps) => {
  const theme = useTheme();
  const ui = useUIStore();
  const router = useRouter();
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [actionType, setActionType] = useState<PaymentMethodActions>(null);
  const { data: paymentMethods, isLoading } = useGetPaymentMethods();
  const [confirmDialogMsg, setConfirmDialogMsg] = useState(null);
  const {
    mutate: setDefaultPaymentMethod,
    isLoading: setDefaultPaymentMethodIsLoading,
    isSuccess: setDefaultPaymentMethodIsSuccess,
    error: setDefaultPaymentMethodError
  } = useSetDefaultPaymentMethod();
  const { mutate: deletePaymentMethod, isLoading: deletePaymentMethodIsLoading, isSuccess: deletePaymentMethodIsSuccess, error: deletePaymentMethodError } = useDeletePaymentMethod();
  const isInactive = connectSubscription?.status === ConnectSubscriptionStatus.Inactive;

  useEffect(() => {
    if (_isLoading(selectedPaymentMethod)) return;
    setSelectedPaymentMethod(null);

    if (setDefaultPaymentMethodIsSuccess) {
      ui.showToast({
        message: "Default payment updated successfully",
        alertType: "success",
        autoHideDuration: 1000,
        position: {
          horizontal: "right",
          vertical: "top"
        }
      });
    }

    if (deletePaymentMethodIsSuccess) {
      ui.showToast({
        message: "Payment method deleted successfully",
        alertType: "success",
        autoHideDuration: 1000,
        position: {
          horizontal: "right",
          vertical: "top"
        }
      });
    }
  }, [setDefaultPaymentMethodIsLoading, deletePaymentMethodIsLoading]);

  const _isLoading = (pm): boolean => {
    if (pm?.id !== selectedPaymentMethod?.id) return false;
    return setDefaultPaymentMethodIsLoading || deletePaymentMethodIsLoading;
  };

  const _setSelectedPaymentMethod = (action: PaymentMethodActions, pm) => {
    if (_isLoading(pm)) return;

    switch (action) {
      case PaymentMethodActions.SetAsDefault:
        if (isInactive) return alert("No Active Subscription");
        setConfirmDialogMsg(`Are you sure you want to replace your default payment method, with card ending in ${pm?.card?.last4}?`);
        break;
      case PaymentMethodActions.Delete:
        if (pm.isDefault) return;
        setConfirmDialogMsg(`Are you sure you want to delete card ending in ${pm?.card?.last4}?`);
        break;
      default:
        setConfirmDialogMsg(null);
        break;
    }
    setSelectedPaymentMethod({ ...pm });
    setActionType(action);
  };

  const _handleActionForSelectedPaymentMethod = () => {
    if (_isLoading(selectedPaymentMethod)) return;
    switch (actionType) {
      case PaymentMethodActions.SetAsDefault:
        {
          if (isInactive) return;
          setDefaultPaymentMethod({ pmId: selectedPaymentMethod?.id });
        }
        break;
      case PaymentMethodActions.Delete:
        {
          if (selectedPaymentMethod.isDefault) return;
          deletePaymentMethod({ pmId: selectedPaymentMethod?.id });
        }
        break;
      default:
        break;
    }
  };

  const _isCardExpired = (_pm) => _pm.card?.expYear <=  currentYear && currentMonth >= _pm.card?.expMonth;

  const _handleSelectedPaymentMethodReset = () => {
    setSelectedPaymentMethod(null);
    setActionType(null);
    setConfirmDialogMsg(null);
  };

  if (connectSubscription?.status === ConnectSubscriptionStatus.Inactive && paymentMethods?.length === 0) return <></>;

  //#region Render
  return (
    <BillingSection>
      <BillingSectionHeader>
        <BillingSectionTitle>Payment Methods</BillingSectionTitle>
      </BillingSectionHeader>
      <BillingSectionBody>
        <Loading when={isLoading}></Loading>
        <Grid container>
          {/* Left */}
          <Grid
            item
            xs={12}
            sm={4}
            sx={{
              "& .MuiGrid-root": { marginBottom: "10px" }
            }}
          >
            <Box sx={{ padding: "10px" }}>
              <h3> Card details</h3>
              <br />
              <Typography>Update your billing details and address. </Typography>
              <Link legacyBehavior href={{ pathname: router.pathname, query: { modal: modalRoutes.addEditPaymentMethod } }}>
                <Button type="button" variant="contained" id="btn-add-new-cc" sx={{ float: "right" }}>
                  Add
                </Button>
              </Link>
            </Box>
          </Grid>
          {/* Right */}
          <Grid item xs={12} sm={8} sx={{ flexDirection: "column", display: "flex", padding: "10px" }}>
            {/* Confirm Dialog */}
            <ConfirmDialog
              show={selectedPaymentMethod !== null}
              message={confirmDialogMsg}
              onConfirm={() => _handleActionForSelectedPaymentMethod()}
              handleClose={() => _handleSelectedPaymentMethodReset()}
            />
            {paymentMethods?.map((pm, key) => {
              return (
                <PillContainer
                  className="pm-container"
                  id={`pm-container-${key}`}
                  data-pm-id={pm.id}
                  data-is-default={pm.isDefault}
                  key={key}
                  style={{
                    backgroundColor: _isLoading(pm) ? theme.palette.grey[100] : pm.isDefault && theme.lighterBlue,
                    padding: "15px",
                    borderColor: pm.isDefault ? theme.componentBorder : "inherit"
                    //color: theme.palette.primary.main
                  }}
                >
                  {/* Credit Card  Icon */}
                  <Box sx={{ display: "flex", alignItems: "center", alignSelf: "center", padding: "5px", marginRight: "10px" }}>
                    <CCIcon type={pm.card?.brand} />
                  </Box>
                  {/* CC Details */}
                  <Box
                    sx={{
                      flexGrow: "100"
                    }}
                  >
                    {/* Credit Card Title */}
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: theme.palette.primary.main, fontWeight: "bold" }}>
                        {capitalizeFirstLetter(pm.card?.brand)} ending in {pm.card?.last4}
                      </span>
                      <br />
                      <i>
                        <small style={{ color: _isCardExpired(pm) ? theme.palette.error.main : theme.palette.grey[700] }}>
                          {_isCardExpired(pm) ? <>Expired</> : <>Expires</>} {monthToPaddedString(pm.card?.expMonth)}/{pm.card?.expYear}
                        </small>
                      </i>
                    </Box>

                    {/* Actions */}
                    <Box id="pm-action" sx={{ display: "flex" }}>
                      <Typography fontFamily={"'Roboto Mono',monospace"}>
                        {/* <Link legacyBehavior href={{ pathname: router.pathname, query: { id: pm.id, modal: modalRoutes.addEditPaymentMethod } }}>
                          <span id={`edit-${pm.id}`} style={{ cursor: "pointer", textDecoration: "underline" }}>
                            <>Edit</>
                          </span>
                        </Link>
                        &nbsp;|&nbsp; */}
                        {pm.isDefault ? (
                          <span data-pm-id={pm.id} id={`default-pm-${pm.id}`}>
                            <b>
                              <small>Default payment method</small>
                            </b>
                          </span>
                        ) : (
                          <>
                            <span
                              id={`set-pm-as-default-${key}`}
                              data-pm-id={pm.id}
                              style={{ cursor: "pointer", textDecoration: "underline" }}
                              onClick={() => _setSelectedPaymentMethod(PaymentMethodActions.SetAsDefault, pm)}
                            >
                              Set as default
                            </span>
                            &nbsp;|&nbsp;
                            <span
                              id={`delete-pm-${key}`}
                              data-pm-id={pm.id}
                              style={{ cursor: "pointer", textDecoration: "underline" }}
                              onClick={() => _setSelectedPaymentMethod(PaymentMethodActions.Delete, pm)}
                            >
                              Delete
                            </span>
                            <br />
                          </>
                        )}
                      </Typography>
                    </Box>
                  </Box>
                  {/* Visual Indicators */}
                  <Box
                    sx={{
                      display: "flex",
                      flexGrow: "1",
                      justifyItems: "flex-end",
                      flexDirection: "row",
                      paddingLeft: "15px"
                    }}
                  >
                    <span>
                      {_isLoading(pm) ? (
                        <CircularProgress variant="indeterminate" size="1.3rem" color="secondary" />
                      ) : (
                        <>
                          {pm.isDefault ? (
                            <>
                              <TaskAltIcon
                                sx={{
                                  color: theme.palette.secondary.main
                                }}
                              />
                            </>
                          ) : (
                            <>
                              <RadioButtonUncheckedIcon />
                            </>
                          )}
                        </>
                      )}
                    </span>
                  </Box>
                </PillContainer>
              );
            })}
          </Grid>
        </Grid>
      </BillingSectionBody>
    </BillingSection>
  );

  //#endregion
};

type CCIconProps = { type: string };
const CCIcon = ({ type }: CCIconProps) => {
  const Icon = useMemo(() => {
    switch (type?.toLocaleLowerCase()) {
      case "visa":
        return <VisaIcon />;
      case "amex":
        return <AmexIcon />;
      case "discover":
        return <DiscoverIcon />;
      case "mastercard":
        return <MastercardIcon />;
      default:
        return <CreditCardIcon fontSize="large" color="primary" />;
    }
  }, [type]);
  return <>{Icon}</>;
};
