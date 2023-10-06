import React from 'react';
import { LightningInvoice } from '@blockspaces/shared/models/spaces/Lightning';

import { Icons } from 'src/platform/components';
import Payment, {
  Name, Time, Details, Type, Amount, Quantity, ConversionAmt,
} from './styles/payment';


const { Plus, InboundPayment, OutboundPayment } =Icons;
type Props = {
    payment: LightningInvoice
}

function Transaction({ payment }:Props) {
  const amount = payment.state === 'SETTLED' ? payment.amt_paid_sat : payment.value;
  const inbound = !!payment.memo;
  let date;
  if (payment.settle_date === 0) {
    date = new Date(payment.creation_date * 1000);
  } else {
    date = new Date(payment.settle_date * 1000);
  }
  return (
    <Payment>
      <Time>{`${date.getMonth() + 1} / ${date.getDate()}` }</Time>
      <Name>{inbound ? decodeURIComponent(payment.memo) : 'Outbound Lightning Payment'}</Name>
      <Details>
        <Amount>
          <Quantity>
            <span className="fak fa-satoshisymbol-solidtilt" />
            {Intl.NumberFormat('en-US').format(amount)}
          </Quantity>
          <ConversionAmt>
            ~$
            {Intl.NumberFormat('en-US').format(Math.ceil(amount / 100000000 * 43902))}
          </ConversionAmt>
        </Amount>
        <Type style={{ background: `${inbound ? '#BE1BF7' : '#7B1AF7'}` }}>
          { inbound ? <InboundPayment /> : <OutboundPayment /> }
        </Type>
      </Details>
    </Payment>
  );
}

export default Transaction;
