import { ConnectSubscriptionExpandedDto } from "@blockspaces/shared/dtos/connect-subscription/ConnectSubscriptionDto";
import { BillingSection, BillingSectionBody, BillingSectionHeader, BillingSectionTitle } from "./billing-section";
import { DataGrid, GridToolbar, GridColDef, GridToolbarContainer, GridToolbarExport } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { Alert, Box, Chip, LinearProgress, Pagination, PaginationItem, Typography } from "@mui/material";
import { _getUiDate, _getUiDateFormatted, _getUiFormattedFiatTotal } from "../utils";
import { useGetInvoicesForTenant } from "../hooks/queries";
import DescriptionIcon from "@mui/icons-material/Description";
import { gridPageCountSelector, gridPageSelector, useGridApiContext, useGridSelector } from "@mui/x-data-grid";
import styled, { useTheme } from "styled-components";
import Link from "next/link";
import { InvoiceStatusPill } from "./invoice-status-pill";

const defaultPageSize = 5;
type BillingHistoryProps = { connectSubscription: ConnectSubscriptionExpandedDto };
export const BillingHistory = ({ connectSubscription }: BillingHistoryProps) => {
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [currentPage, setCurrentPage] = useState(0);
  const [sortByField, setSortByField] = useState("period.billingStart");
  const [sortByFieldDirection, setSortByFieldDirection] = useState("asc");
  const { data: invoicesResult, isLoading, isFetching } = useGetInvoicesForTenant(currentPage, pageSize, sortByField, sortByFieldDirection);

  return (
    <BillingSection style={{ paddingBottom: "3rem" }}>
      <BillingSectionHeader>
        <BillingSectionTitle>Billing History</BillingSectionTitle>
      </BillingSectionHeader>
      <BillingSectionBody>
        <Box m="0 0 0 0" height="45vh">
          <DataGrid
            components={{
              //Toolbar: CustomToolbar
              LoadingOverlay: LinearProgress,
              Pagination: CustomPagination,
              NoRowsOverlay: CustomNoRowsOverlay
            }}
            sortingOrder={["desc", "asc"]}
            initialState={{
              sorting: {
                sortModel: [{ field: sortByField, sort: sortByFieldDirection as any }]
              }
            }}
            loading={isLoading || isFetching}
            rows={invoicesResult?.data || []}
            columns={gridColumns}
            pagination
            disableSelectionOnClick
            pageSize={pageSize}
            rowCount={invoicesResult?.count || 0}
            paginationMode="server"
            sortingMode="server"
            disableColumnFilter
            autoHeight
            onPageChange={(newPage) => setCurrentPage(newPage)}
            onSortModelChange={(d) => {
              if (d && d.length) {
                const field = d[0].field;
                const sortDir = d[0].sort;
                setSortByField(field);
                setSortByFieldDirection(sortDir);
              } else {
                setSortByField(null);
                setSortByFieldDirection(null);
              }
            }}
            page={currentPage}
            onPageSizeChange={(size) => setPageSize(size)}
          />
        </Box>
      </BillingSectionBody>
    </BillingSection>
  );
};

function CustomToolbar() {
  return (
    <GridToolbarContainer>
      <GridToolbarExport printOptions={{ disableToolbarButton: true }} />
    </GridToolbarContainer>
  );
}

function CustomPagination() {
  const apiRef = useGridApiContext();
  const page = useGridSelector(apiRef, gridPageSelector);
  const pageCount = useGridSelector(apiRef, gridPageCountSelector);

  return (
    <Pagination
      sx={{
        marginRight: "10px"
      }}
      color="primary"
      variant="outlined"
      shape="rounded"
      page={page + 1}
      count={pageCount}
      renderItem={(props2) => <PaginationItem {...props2} />}
      onChange={(event, value) => {
        event.preventDefault();
        apiRef.current.setPage(value - 1);
      }}
    />
  );
}


const gridColumns: GridColDef[] = [
  {
    field: "number",
    headerName: "Invoice #",
    editable: false,
    flex: 1,
    renderCell: (params) => <Link href={`/billing/invoice/${params.row.id}`}>{params.row.number}</Link>
  },
  {
    field: "period.billingStart",
    headerName: "Date",
    editable: false,
    flex: 1,
    renderCell: (params) => <>{_getUiDateFormatted(params.row.period.billingStart * 1000)}</>
  },
  {
    field: "amount",
    headerName: "Amount",
    editable: false,
    flex: 1,
    renderCell: (params) => <>{_getUiFormattedFiatTotal(params.row.amount)}</>
  },
  {
    field: "status",
    headerName: "Status",
    editable: false,
    renderCell: (params) => (
      <Box
        sx={{
          "& .MuiChip-label": {
            fontFamily: "'Roboto Mono',monospace"
          }
        }}
      >
        <InvoiceStatusPill status={params.row.status} />
      </Box>
    ),
    flex: 1
  }
];

function CustomNoRowsOverlay() {
  const theme = useTheme();
  return (
    <Box
      id="no-row-overlay"
      sx={{
        display: "flex",
        justifyContent: "center",
        height: "100%",
        color: theme.palette.grey[300]
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", margin: "auto" }}>
        <DescriptionIcon />
        No Invoice History
      </Box>
    </Box>
  );
}
