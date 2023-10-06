import React, { useMemo, useState } from 'react';
import { DateTime } from 'luxon';
import numeral from 'numeral'

import { ColumnLabel, Image, Header, Row, Description, StyledPaymentsTable, Amount, EmptyValue, SettleDate, Logo, Link, PaginationHeader, PageSizeSelector, PaginationFooter, PaginationButton, ButtonWrapper, PageSizeSelectorWrapper } from './payments-table.styles';

import { Satoshi } from '@icons';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { useRefreshAllInvoices } from '@lightning/queries';
import { useGetCurrentUser } from '@platform/hooks/user/queries';
import { Tooltip } from '@platform/common';
import { buildIntegrationUrl, getAmounts } from '@lightning/utils';

const COLUMN_LABELS = [
  'DATE',
  'DESCRIPTION',
  'PAYMENT TYPE',
  'INTEGRATION',
  'AMOUNT'
];

const DEFAULT_DESCRIPTION = 'Bitcoin Invoicing & Payments';

const PaymentTypes = ['on-chain', 'lightning'] as const;
type PaymentType = typeof PaymentTypes[number];
type ErpMetadata = {
  domain: string,
  dataType: string,
  value: string
}

type Transaction = {
  settleDate: string,
  description: string,
  integrationUrl: string,
  erpMetadata: ErpMetadata[],
  amount: { btc: number, fiat: number },
  timestamp: number,
  type: PaymentType,
  details?: any
}

const usePageData = () => {
  const { refreshedInvoices, refreshInvoicesLoading, refreshInvoicesError } = useRefreshAllInvoices()
  const { data: user } = useGetCurrentUser()

  const transactions = useMemo(() => {
    const transactionData: Transaction[] = []
    if (refreshedInvoices?.data) {
      refreshedInvoices?.data?.invoices?.forEach((invoice) => {
        transactionData.push({
          timestamp: invoice.settleTimestamp,
          settleDate: DateTime.fromMillis(invoice.settleTimestamp).toFormat('M/d'),
          description: invoice.description,
          integrationUrl: buildIntegrationUrl(invoice.integrations, invoice.erpMetadata),
          erpMetadata: invoice?.erpMetadata ?? [],
          amount: getAmounts(invoice.quote.amount),
          type: 'lightning'
        })
      })
      refreshedInvoices?.data?.payments?.forEach(payment => {
        transactionData.push({
          timestamp: payment.settleTimestamp,
          settleDate: DateTime.fromMillis(payment.settleTimestamp).toFormat('M/d'),
          description: DEFAULT_DESCRIPTION,
          integrationUrl: buildIntegrationUrl(payment.integrations, payment.erpMetadata, true),
          erpMetadata: payment?.erpMetadata ?? [],
          amount: getAmounts(payment.netBalanceChange ?? payment.amount, true),
          type: 'lightning'
        })
      })
      refreshedInvoices?.data?.onchainInvoices?.forEach(txn => {
        transactionData.push({
          timestamp: txn.paidTransaction.blockTimestamp,
          settleDate: DateTime.fromMillis(txn.paidTransaction.blockTimestamp).toFormat("M/d"),
          description: `${DEFAULT_DESCRIPTION}`,
          integrationUrl: null,
          erpMetadata: txn?.erpMetadata ?? [],
          amount: getAmounts(txn.paidTransaction.netBalanceChange),
          type: "on-chain",
          details: {
            feesPaid: getAmounts(txn.paidTransaction.totalFees),
            mempoolLink: `https://mempool.space/tx/${txn.paidTransaction.txnHash}`
          }
        });
      });

    }
    return transactionData
  }, [refreshedInvoices])

  return {
    refreshedInvoices,
    transactions: transactions,
    displayFiat: user.appSettings.bip.displayFiat,
    loading: refreshInvoicesLoading,
    error: refreshInvoicesError
  }
}

export const PaymentsTable = () => {
  const { transactions, displayFiat } = usePageData()
  const [ pageSize, setPageSize ] = useState(10);
  const [ pageIndex, setPageIndex ] = useState(0);

  const DisplayAmount = ({ data }) => {
    const out = data.amount.btc < 0
    if (displayFiat) {
      return <Amount out={out}>{out ? '-' : ''}${numeral(Math.abs(data.amount.fiat)).format("0.00")}</Amount>
    } else {
      return <Amount out={out}>{out ? '-' : ''}<Satoshi color={out ? "red" : "black"} />{numeral(Math.abs(data.amount.btc)).format('0,0')}</Amount>
    }
  }
  const columns = ".5fr 3fr .7fr 1fr .7fr";
  const alignment = ["center", "start", "center", "center", "center"]
  const rowHeight = 4.5;
  const labelHeight = 4;
  let rows = `3rem ${labelHeight}rem `
  const shownTransactions = transactions
    .slice(pageIndex * pageSize, Math.min((pageIndex+1) * pageSize, transactions.length))
  shownTransactions.forEach(() => {
    rows = rows + `${rowHeight}rem `
  })

  transactions.sort((a, b) => b.timestamp - a.timestamp);
  const rowItems = transactions
    .slice(pageIndex * pageSize, Math.min((pageIndex+1) * pageSize, transactions.length))
    .map((data, i) => {
      return (
        <Row key={`row-key-${i}`} position={i} columns={columns} height={rowHeight}>
          <SettleDate>{data.settleDate}</SettleDate>
          {data.type === "on-chain" ? (
            <Description target="_blank" href={data.details.mempoolLink}>
              <Tooltip placement="left" content="On-Chain Transaction">
                {data.description}
              </Tooltip>
            </Description>
          ) : (
            <Description>
              <Tooltip placement="left" content="Lightning Payment">
                {data.description}
              </Tooltip>
            </Description>
          )}
          {data.type === "on-chain" ? (
            <Link target="_blank" href={data.details.mempoolLink}>
              <Tooltip placement="left" content="On-Chain Transaction (Click to view)">
                ⛓️
              </Tooltip>
            </Link>
          ) : (
            <Link>
              <Tooltip placement="left" content="Lightning Payment">
                ⚡
              </Tooltip>
            </Link>
          )}
          {data.erpMetadata?.filter((x) => x?.domain?.toLowerCase() === "qbo")?.length ? (
            <Logo href={data.integrationUrl} target="_blank">
              <Image alt="QuickBooks Logo" src="/images/logos/quickbooks.png" />{" "}
            </Logo>
          ) : data.integrationUrl && data.erpMetadata.length === 0 ?
            <Logo href={data.integrationUrl} target="_blank">
              <Image alt="QuickBooks Logo" src="/images/logos/quickbooks.png" />{" "}
            </Logo>
            : (
              <EmptyValue>N/A</EmptyValue>
            )}
          <DisplayAmount data={data} />
        </Row>
      );
    });
  
  const PaginationButtons = () => {
    return (
      <ButtonWrapper>
        <PaginationButton
          disabled={pageIndex === 0}
          onClick={() => setPageIndex(pageIndex - 1)}
        ><ChevronLeft /> Previous</PaginationButton>
        <PaginationButton 
          disabled={(pageIndex + 1) * pageSize >= transactions.length}
          onClick={() => setPageIndex(pageIndex + 1)}
        >
          Next <ChevronRight />
        </PaginationButton>
      </ButtonWrapper>
    )

  }

  return (
    <StyledPaymentsTable columns={columns} rows={rows} height={rowHeight * (pageSize + 2.5)}>
      <PaginationHeader>
        <PageSizeSelectorWrapper>
          Show 
          <PageSizeSelector value={pageSize} onChange={(e) => setPageSize(parseInt(e.target.value))}>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </PageSizeSelector> 
          entries per page
        </PageSizeSelectorWrapper>
        <PaginationButtons />
      </PaginationHeader>
      <Header columns={columns}>
        {COLUMN_LABELS.map((label, i) => (
          <ColumnLabel key={`column-key-${i}`} position={i + 1} alignment={alignment[i]}>{label}</ColumnLabel>
        ))}
      </Header>
      {rowItems}
      <PaginationFooter>
        <PageSizeSelectorWrapper>Showing {pageIndex * pageSize + 1} to {Math.min((pageIndex + 1) * pageSize, transactions.length)} of {transactions.length} entries</PageSizeSelectorWrapper>
        <PaginationButtons />
      </PaginationFooter>
    </StyledPaymentsTable>
  );
};
