import { Box, Button, Grid } from "@mui/material";
import { useAddToWishlist } from "@src/platform/hooks/wishlist";
import { ModalContent } from "@src/platform/components/common/modal/modal-content";
import { useGetActiveConnectors, useGetConnector } from "@src/platform/hooks/connectors";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import styled from "styled-components";

import { useUIStore } from "@src/providers";
import { useAcceptInvite } from "@src/platform/hooks/tenant/mutations";
import { useGetCurrentUser } from "@src/platform/hooks/user/queries";

export const AcceptOrganizationInvitationDialog = () => {
  const router = useRouter();
  const user = useGetCurrentUser();
  const { mutate: acceptInvite, isLoading, isSuccess, isError, mutateAsync } = useAcceptInvite();
  const ui = useUIStore();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

    useEffect(() => {
    if (isSuccess) {
      _onCancel();
    }
  }, [isSuccess]);
  
  const _onAcceptInvite = () => {
    const tenantId:string = router.query.invitorTenantId as string;
    acceptInvite({tenantId})
  };

  const _onCancel = () => {
    if (router.pathname === "/connect") {
      router.back();
    } else router.replace({ pathname: router.pathname });
  };

  return (
    <ModalContent
      size="small"
      title={`Invitation to Organization`}
      primaryBtnText="Accept"
      secondaryBtnText="Ignore"
      onPrimaryActionClick={_onAcceptInvite}
      onCancel={_onCancel}
      isSubmitting={isLoading}
    >{router.query.invitorTenantName} has invited you to join their organization. Click Accept to accept the invitation</ModalContent>
  );
};
