import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { useEffect, useState } from "react";

type ConfirmDialogProps = {
  title?: string;
  message: string;
  show: boolean;
  disableActions?: boolean;
  handleClose: (event?: object, reason?: string) => void;
  onConfirm: () => void;
  hideSecondaryBtn?: boolean;
  primaryBtnText?: string;
  secondaryBtnText?: string;
};
export default function ConfirmDialog({
  title,
  message,
  show,
  onConfirm,
  handleClose,
  disableActions,
  primaryBtnText = "Confirm",
  secondaryBtnText = "Cancel",
  hideSecondaryBtn = false
}: ConfirmDialogProps) {
  const [open, setOpen] = useState(show);

  useEffect(() => {
    if (show === true && open === true) return;
    setOpen(show);
  }, [show]);
  const _handleClose = (cb: () => void) => {
    if (disableActions === true) return;
    setOpen(false);
    if (cb) {
      try {
        cb();
      } catch (er) {
        // eat
      }
    }
  };

  return (
    <div>
      <Dialog id="confirm-dialog" open={open} onClose={handleClose} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
        <DialogTitle id="alert-dialog-title">{title || "Please confirm"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">{message}</DialogContentText>
        </DialogContent>
        <DialogActions>
          {hideSecondaryBtn ? (
            <></>
          ) : (
            <Button id="btnConfirmDialogCancel" onClick={() => _handleClose(handleClose)} color="secondary" type="button" variant="outlined">
              {secondaryBtnText}
            </Button>
          )}

          <Button id="btnConfirmDialogConfirm" onClick={() => _handleClose(onConfirm)} autoFocus variant="contained">
            {primaryBtnText}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
