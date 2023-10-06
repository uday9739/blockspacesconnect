import { Box, Grid, useMediaQuery } from "@mui/material";
import { Logo } from "@src/platform/components";
import { Loading } from "@src/platform/components/common";
import { HeaderLogo } from "@src/platform/components/layouts/header";
import styled, { useTheme } from "styled-components";
import { useGetInvoice } from "../hooks/queries";
import { _getUiDateFormatted, _getUiFormatted$Total, _getUiFormattedFiatTotal } from "../utils";
import { InvoiceStatusPill } from "./invoice-status-pill";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Link from "next/link";

export const InvoiceContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 1000px;
  min-height: 350px;
  margin-left: auto;
  margin-right: auto;
  margin-top: 25px;
  background: #fff;
  box-shadow: ${(p) => p.theme.mediumBoxShadow};
  border-radius: 1.875rem;
  padding: 45px;
  & .InvoiceContainerRow {
    width: "100%";
  }
`;

type InvoiceDetailsProps = { id: string };
export const InvoiceDetails = ({ id }: InvoiceDetailsProps) => {
  const theme = useTheme();
  const isSmallOrLess = useMediaQuery(theme.breakpoints.down("sm"));
  const { data: invoice, isLoading, isFetching, error } = useGetInvoice(id);
  if (isLoading) return <Loading when={isLoading}></Loading>;
  return (
    <Box sx={{ maxWidth: "1000px", margin: "auto", marginTop: "25px" }}>
      <Link
        href={"/billing"}
        style={{
          paddingLeft: "15px"
        }}
      >
        {"<--  Back"}
      </Link>
      <InvoiceContainer>
        {/* Invoice Header Information */}
        <Grid className="InvoiceContainerRow" container sx={{ paddingBottom: isSmallOrLess ? "0" : "25px" }}>
          <Grid item xs={12} sm={6} sx={{}}>
            <img alt="" width="250px" src="/connect/images/logos/bslogo2022-1.png" />
          </Grid>
          <Grid item xs={12} sm={6} sx={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <span
              style={{
                marginLeft: "auto"
              }}
            >
              <InvoiceStatusPill status={invoice?.status} />
            </span>
            <span
              style={{
                marginLeft: "auto"
              }}
            >
              <b> {invoice?.number}</b>
            </span>
          </Grid>
        </Grid>
        {/* Billing Address */}
        <Grid className="InvoiceContainerRow" container sx={{ paddingBottom: isSmallOrLess ? "0" : "25px" }}>
          <Grid item xs={6} sx={{}}>
            <Box sx={{ marginBottom: "15px", color: theme.palette.grey[700], textTransform: "uppercase", fontSize: "smaller" }}> INVOICE FROM</Box>
            Blockspaces
            <br />
            802 E. Whiting Street
            <br />
            Tampa, FL 33602
            <br />
            (813) 500-8585
            <br />
            info@blockspaces.com
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ marginBottom: "15px", color: theme.palette.grey[700], textTransform: "uppercase", fontSize: "smaller" }}> INVOICE TO</Box>
            {invoice?.billingAddress?.fullName}
            <br />
            {invoice?.billingAddress?.addressLine1}
            {invoice?.billingAddress?.addressLine2 ? (
              <>
                {invoice?.billingAddress?.addressLine2} <br />
              </>
            ) : null}
            <br />
            {invoice?.billingAddress?.city}, {invoice?.billingAddress?.state} {invoice?.billingAddress?.postalCode}
          </Grid>
        </Grid>
        {/* Dates */}
        <Grid className="InvoiceContainerRow" container sx={{ paddingBottom: isSmallOrLess ? "0" : "25px" }}>
          <Grid item xs={6}>
            <Box sx={{ marginBottom: "15px", color: theme.palette.grey[700], textTransform: "uppercase", fontSize: "smaller" }}> Period Start</Box>
            {_getUiDateFormatted(invoice?.period?.billingStart * 1000)}
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ marginBottom: "15px", color: theme.palette.grey[700], textTransform: "uppercase", fontSize: "smaller" }}> Period End</Box>
            {_getUiDateFormatted(invoice?.period?.billingEnd * 1000)}
          </Grid>
        </Grid>

        {/* Invoice Line Items */}
        <TableContainer
          id="invoice-line-details"
          sx={{
            "& thead tr th": {
              color: theme.palette.grey[700]
            }
          }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Qty</TableCell>
                <TableCell>Unit Price</TableCell>
                <TableCell>Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invoice?.lines?.map((row, index) => (
                <TableRow key={index}>
                  <TableCell component="th" scope="row">
                    {index + 1}
                  </TableCell>
                  <TableCell>
                    {row.title}
                    <br />
                    <small>{row.description}</small>
                  </TableCell>
                  <TableCell>{row.quantity}</TableCell>
                  <TableCell>{_getUiFormatted$Total(row.unitAmount)}</TableCell>
                  <TableCell>{_getUiFormatted$Total(row.lineTotal)}</TableCell>
                </TableRow>
              ))}
              <TableRow sx={{ "& td": { border: 0 } }}>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell>Subtotal</TableCell>
                <TableCell>{_getUiFormatted$Total(invoice?.amount - (invoice?.totalDiscountAmount || 0))}</TableCell>
              </TableRow>
              <TableRow sx={{ "& td": { border: 0 } }}>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell>Discount</TableCell>
                <TableCell>
                  <Box sx={{ color: theme.palette.error.main }}>-{_getUiFormatted$Total(invoice?.totalDiscountAmount || 0)}</Box>
                </TableCell>
              </TableRow>
              <TableRow sx={{ "& td": { paddingBottom: "25px" } }}>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell>
                  <b>Total</b>
                </TableCell>
                <TableCell>
                  <b>{_getUiFormatted$Total(invoice?.amount)}</b>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
        {/* Invoice Footer */}
        <Grid className="InvoiceContainerRow" container>
          <Grid item xs={12} sm={8} sx={{ display: "flex", justifyContent: "flex-start" }}>
            <small>
              <i> ** Please note metered usage is always 2 days in arrears. </i>
              {invoice?.period?.meteredUsageStart !== invoice?.period?.meteredUsageEnd ? (
                <>
                  Metered usage dates {_getUiDateFormatted(invoice?.period?.meteredUsageStart)} -{_getUiDateFormatted(invoice?.period?.meteredUsageEnd)}
                </>
              ) : (
                <></>
              )}
            </small>
          </Grid>
          <Grid item xs={12} sm={6} sx={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}></Grid>
        </Grid>
      </InvoiceContainer>
    </Box>
  );
};
