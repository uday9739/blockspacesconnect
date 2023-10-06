import React, { useState } from 'react';
import { LightningInvoice } from '@blockspaces/shared/models/spaces/Lightning';

import Invoices, { Filter, Filters, InvoiceList } from './styles/invoices';
import Transaction from './transaction';

type Invoices = {
    open: LightningInvoice[],
    settled: LightningInvoice[],
    closed: LightningInvoice[]
}

type Props = {
    invoices: Invoices
}

function INVOICES({ invoices }:Props) {
  const [invoiceType, setInvoiceType] = useState('settled');

  return (
    <Invoices>
      <Filters>
        <Filter
          data-selected={invoiceType === 'settled'}
          onClick={() => setInvoiceType('settled')}
        >
          PAID
        </Filter>
        <Filter
          data-selected={invoiceType === 'open'}
          onClick={() => setInvoiceType('open')}
        >
          PENDING
        </Filter>
      </Filters>
      <InvoiceList>
        {invoices[invoiceType].map((invoice) => (
          <Transaction payment={invoice} key={invoice.creation_date} />
        ))}
      </InvoiceList>
    </Invoices>
  );
}

export default INVOICES;
