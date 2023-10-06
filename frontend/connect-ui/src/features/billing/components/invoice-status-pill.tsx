import { ConnectSubscriptionInvoiceStatus } from "@blockspaces/shared/models/connect-subscription/ConnectSubscription";
import { Chip } from "@mui/material";
import PaidIcon from "@mui/icons-material/Paid";
import InfoIcon from "@mui/icons-material/Info";
import BlockIcon from "@mui/icons-material/Block";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

export const InvoiceStatusPill = ({ status }) => {
  switch (status) {
    case ConnectSubscriptionInvoiceStatus.Draft:
    case ConnectSubscriptionInvoiceStatus.Open:
      return <Chip label={`${status}`} color="warning" size="small" icon={<InfoIcon />} variant="outlined" sx={{ width: "75px" }} />;
    case ConnectSubscriptionInvoiceStatus.Paid:
      return <Chip label={`${status}`} color="success" size="small" variant="outlined" icon={<CheckCircleIcon />} sx={{ width: "75px" }} />;
    case ConnectSubscriptionInvoiceStatus.Void:
      return <Chip label={`${status}`} color="info" size="small" variant="outlined" icon={<BlockIcon />} sx={{ width: "75px" }} />;
    default:
      return <Chip label={`${status}`} color="info" size="small" variant="outlined" icon={<BlockIcon />} sx={{ width: "75px" }} />;
  }
};
