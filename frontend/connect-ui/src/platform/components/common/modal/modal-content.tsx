import { Box, Button, CircularProgress } from "@mui/material";
import { ModalContainer, ModalHeaderCloseWrapper, ModalTitle } from "./styles";
import { Cancel } from "@icons";
import { PropsWithChildren } from "react";
import { Loading } from "../loading";
import { useRouter } from "next/router";

type ModalContentProps = {
  title: string;
  isSubmitting?: boolean;
  isLoading?: boolean;
  disablePrimaryActionOverride?: boolean;
  primaryBtnText?: string;
  secondaryBtnText?: string;
  hidePrimaryAction?: boolean;
  onCancel?: () => void;
  onPrimaryActionClick?: () => void;
  size?: "small" | "medium" | "large";
  isSubmittingText?: string;
};
export const ModalContent = ({
  title,
  onCancel = null,
  onPrimaryActionClick,
  children,
  isSubmitting,
  isLoading,
  primaryBtnText = "Save",
  secondaryBtnText = "Cancel",
  disablePrimaryActionOverride,
  size = "medium",
  isSubmittingText = "Submitting ...",
  hidePrimaryAction = false
}: PropsWithChildren<ModalContentProps>) => {
  const router = useRouter();
  const _onCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      let referrer = (document as any).referrer;
      router.back();
    }
  };
  const width = size === "small" ? "33%" : size === "medium" ? "50%" : size === "large" ? "75%" : null;
  return (
    <ModalContainer id="modal-container" style={{ width: width }}>
      {/* Head */}
      <Box id="modal-content-header" sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
        <ModalTitle>{title}</ModalTitle>
        <ModalHeaderCloseWrapper style={{ alignSelf: "center" }} onClick={_onCancel}>
          <Cancel />
        </ModalHeaderCloseWrapper>
      </Box>
      {/* Body */}
      <Box id="modal-content-body" sx={{ minHeight: "25px", width: "100%" }}>
        <Loading when={isLoading} />
        {children}
      </Box>
      {/* footer */}
      <Box id="modal-content-footer" sx={{ display: "flex", flexDirection: "row-reverse", alignContent: "flex-end", width: "100%", margin: "15px" }}>
        {/* Primary Action */}
        {hidePrimaryAction ? (
          <></>
        ) : (
          <Button
            id="btn-modal-container-primary-action"
            type="button"
            variant="contained"
            color="primary"
            onClick={onPrimaryActionClick}
            disabled={isSubmitting || isLoading || disablePrimaryActionOverride}
          >
            {isSubmitting ? (
              <>
                <CircularProgress variant="indeterminate" size="1.3rem" color="secondary" /> &nbsp; {isSubmittingText}
              </>
            ) : (
              <>{primaryBtnText}</>
            )}
          </Button>
        )}

        {/* Secondary Action */}
        <Button id="btn-modal-container-secondary-action" type="button" variant="contained" color="secondary" onClick={_onCancel} disabled={isSubmitting || isLoading}>
          {secondaryBtnText}
        </Button>
      </Box>
    </ModalContainer>
  );
};
