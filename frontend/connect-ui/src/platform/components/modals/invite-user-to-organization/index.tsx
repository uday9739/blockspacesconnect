import { ModalContent } from "@src/platform/components/common/modal/modal-content";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useUIStore } from "@src/providers";
import { useAcceptInvite, useInviteUserToTenant } from "@src/platform/hooks/tenant/mutations";
import { useGetCurrentUser } from "@src/platform/hooks/user/queries";
import { Box } from "@mui/material";
import { useForm } from "react-hook-form";
import { classValidatorResolver } from "@hookform/resolvers/class-validator";
import { Title, TextInput, IOption, PhoneInputSelect } from "@platform/common";
import { IsNotEmpty, IsString } from "class-validator";

class InviteUser {
  @IsString()
  @IsNotEmpty({ message: "Email is required" })
  email: string;
}

export const InviteUserToOrganizationDialog = () => {
  const router = useRouter();
  const user = useGetCurrentUser();
  const ui = useUIStore();
  const { mutate: invite, isSuccess, isLoading } = useInviteUserToTenant();
  const { watch, reset, formState, handleSubmit, control, register, getValues, setValue, setError, clearErrors } = useForm<InviteUser>({
    mode: "onTouched",
    resolver: classValidatorResolver(InviteUser),
    values: { email: null }
  });
  watch();

  useEffect(() => {
    if (isSuccess) {
      ui.showToast({
        message: "Invitation Sent",
        alertType: "success",
        autoHideDuration: 5000,
        position: {
          horizontal: "right",
          vertical: "top"
        }
      });
      router.back();
    }
  }, [isSuccess]);

  const _onPrimaryClick = (data: InviteUser) => {
    const tenantId: string = router.query.tenantId as string;
    invite({ tenantId: tenantId, email: data.email });
  };
  const _onCancel = () => {
    router.push({ pathname: router.pathname });
  };

  return (
    <ModalContent
      size="small"
      title={`Invite User`}
      primaryBtnText="Send Invite"
      secondaryBtnText="Dismiss"
      onPrimaryActionClick={handleSubmit(_onPrimaryClick)}
      onCancel={_onCancel}
      isSubmitting={isLoading}
    >
      <Box>
        <TextInput
          register={register}
          disabled={isLoading}
          name="email"
          type="text"
          label="Email"
          value={getValues("email")}
          error={!!formState.errors["email"]}
          errorMessage={formState.errors["email"]?.message || ""}
        />
      </Box>
    </ModalContent>
  );
};
