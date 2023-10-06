import { useRef, useMemo } from "react";
import { useRouter } from "next/router";

import { PaymentType } from "@blockspaces/shared/models/lightning/Invoice";
import { getCheckoutReturnQuery } from "@lightning/hooks";
import { UserProfile, ModalWrap, ToS, Welcome, AddApp, AddAppSuccess } from "@platform/components/modals";
import { Checkout, FinalizeConnection, PosInvoicePaid, UnlockModal, LiquidityModal, PayModal } from "@lightning/components/modals";
import { DeleteEndpoint } from "@endpoints/components/modals";
import { ErrorBoundaryPlus, GenericComponentErrorFallback } from "@errors";
import { CancelSubscription } from "@platform/components/cancel-subscription/cancel-subscription";
import { WithdrawSuccessful } from "@lightning/components/modals";
import { AddEditPaymentMethodsModal } from "@src/features/billing/components/add-edit-payment-method-modal";
import { Integrations } from "@lightning/components/modals/integrations";
import IntegrationsWidget from "@lightning/components/modals/integrations-widget";
import { DisconnectIntegration } from "@lightning/components/modals/integrations/disconnect";
import { JoinPrivateBeta } from "@src/platform/components/modals/join-private-beta";
import { AddLightningSuccess } from "@src/platform/components/modals/add-app/add-lightning-success";
import { AcceptOrganizationInvitationDialog } from "@src/platform/components/accept-organization-invitation";
import { ManageOrganization } from "@src/platform/components/modals/organization/manage-organization";
import { UserOrganizationPermissions } from "@src/platform/components/user-organization-permissions/user-organization-permissions-moda";
import { OrganizationSettings } from "@src/platform/components/organization-settings/organization-settings";
import { InviteUserToOrganizationDialog } from "@src/platform/components/modals/invite-user-to-organization";
export const modalRoutes = {
  addEditPaymentMethod: "add-edit-payment-method"
};
/**
 * A higher order component (HoC) that requires the user to be logged in
 * before the wrapped component will be rendered.
 *
 * If the user is not logged in, they'll be automatically redirected to the login page
 */
function MODAL_ROUTES_CONTROLLER() {
  const router = useRouter();
  const wrap = useRef();

  const [Modal, returnQuery, preventClickOut] = useMemo(() => {
    let modal = null;
    let preventClickOut = false;
    let returnQuery = { ...router.query };
    delete returnQuery.modal;

    if (router.query.modal === "profile") {
      modal = <UserProfile />;
    }

    if (router.query.modal === "terms-of-service") {
      preventClickOut = true;
      modal = <ToS />;
    }

    if (router.query.modal === "welcome") {
      preventClickOut = true;
      modal = <Welcome />;
    }

    if (router.query.modal === "finalizeConnection") {
      if (router.query.step === "not-connected") {
        returnQuery = {};
        preventClickOut = false;
      } else {
        preventClickOut = true;
      }
      modal = <FinalizeConnection />;
    }

    if (router.query.modal === "integrations") {
      returnQuery = {};
      modal = <Integrations />;
    }
    if (router.query.modal === "integration-widget") {
      returnQuery = {};
      preventClickOut = true;
      modal = <IntegrationsWidget />;
    }

    if (router.query.modal === "disconnect-integration") {
      returnQuery = {};
      modal = <DisconnectIntegration />;
    }

    if (router.query.modal === "checkout") {
      preventClickOut = true;
      returnQuery = getCheckoutReturnQuery(router.query);
      modal = <Checkout type={router.query.type as PaymentType} />;
    }

    if (router.query.modal === "locked") {
      preventClickOut = true;
      modal = <UnlockModal />;
    }

    if (router.query.modal === "setup-liquidity") {
      preventClickOut = true;
      modal = <LiquidityModal />;
    }

    if (router.query.modal === "pos-invoice-paid") {
      returnQuery = getCheckoutReturnQuery(router.query);
      modal = <PosInvoicePaid />;
    }

    if (router.query.modal === "add-app") {
      preventClickOut = true;
      modal = <AddApp />;
    }

    if (router.query.modal === "add-success") {
      modal = <AddAppSuccess />;
    }

    if (router.query.modal === "add-lightning-success") {
      modal = <AddLightningSuccess />;
    }

    if (router.query.modal === "delete-endpoint") {
      delete returnQuery.endpointId;
      modal = <DeleteEndpoint closeModal={() => router.replace({ pathname: router.pathname, query: returnQuery })} />;
    }

    if (router.query.modal === "cancel-subscription") {
      modal = <CancelSubscription />;
    }
    if (router.query.modal === "pay") {
      modal = <PayModal />;
    }
    if (router.query.modal === modalRoutes.addEditPaymentMethod) {
      preventClickOut = true;
      modal = <AddEditPaymentMethodsModal />;
    }

    if (router.query.modal === "withdraw-successful") {
      modal = <WithdrawSuccessful />;
    }

    if (router.query.modal === "join-private-beta") {
      modal = <JoinPrivateBeta />;
    }

    if (router.query.modal === "accept-organization-invitation") {
      modal = <AcceptOrganizationInvitationDialog />;
    }
    if (router.query.modal === "organization-settings") {
      modal = <OrganizationSettings />;
    }
    if (router.query.modal === "add-organization") {
      modal = <OrganizationSettings isCreate />;
    }
    if (router.query.modal === "user-organization-permissions") {
      modal = <UserOrganizationPermissions />;
    }
    if (router.query.modal === "manage-organization") {
      modal = <ManageOrganization />;
    }
    if (router.query.modal === "invite-user") {
      modal = <InviteUserToOrganizationDialog />;
    }

    return [modal, returnQuery, preventClickOut];
  }, [router.query]);

  if (!Modal) return null;
  return (
    <ModalWrap
      id={router.query?.modal?.toString()}
      ref={wrap}
      onClick={(e) => {
        if (preventClickOut) return;
        e.target === wrap.current && router.replace({ pathname: router.pathname, query: returnQuery });
      }}
    >
      <ErrorBoundaryPlus FallbackComponent={GenericComponentErrorFallback}>{Modal}</ErrorBoundaryPlus>
    </ModalWrap>
  );
}

export default MODAL_ROUTES_CONTROLLER;
