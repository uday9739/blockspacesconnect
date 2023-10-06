import React, { useEffect, useState } from 'react';
import { ObservableLightningNetwork, LightningStatus } from 'src/features/lightning/api';
import { yupResolver } from '@hookform/resolvers/yup';
import { SubmitHandler, useForm } from 'react-hook-form';
import * as yup from 'yup';
import FundWallet, {
  Body, Title, Subtitle, BuyForm, FundingMenu, MenuOptions, Option, FormDescription, Row, Column, PurchaseBTC, TextInput, ArrowIcon, Currency, SkipForNow,
} from './styles/fund-wallet';
import { Icons } from "src/platform/components";

const { Arrow } = Icons;
type Props = {
  network: ObservableLightningNetwork
}

interface IAddCredentialForm { USD: number, BTC: number }
const schema: yup.SchemaOf<IAddCredentialForm> = yup.object({
  USD: yup.number().required(),
  BTC: yup.number(),
});

export default function LIGHTNING_FUND_WALLET({ network }: Props) {
  const [selectedOption, setSelectedOption] = useState('BUY');

  const form = useForm<IAddCredentialForm>({
    mode: 'onTouched',
    criteriaMode: 'all',
    resolver: yupResolver(schema),
  });
  form.watch();

  useEffect(() => {
    const USD = form.getValues('USD');
    USD > 0
      ? form.setValue('BTC', USD / 40000)
      : form.setValue('BTC', 0);
  }, [form.getValues('USD')]);

  const buyBTC: SubmitHandler<IAddCredentialForm> = async (registration) => {
    console.log('BUYING');
  };

  const conversionRate = 40000;

  return (
    <FundWallet>
      <Body>
        <Title>FUND YOUR LIGHTNING WALLET</Title>
        <Subtitle>
          In order to use the Lightning Network
          {' '}
          <br />
          you'll need to add BTC to your Lightning Wallet
        </Subtitle>
        <FundingMenu>
          <MenuOptions>
            <Option
              onClick={() => setSelectedOption('BUY')}
              data-selected={selectedOption === 'BUY'}
            >
              BUY BTC
            </Option>
            <Option
              onClick={() => setSelectedOption('TRANSFER')}
              data-selected={selectedOption === 'TRANSFER'}
            >
              TRANSFER BTC
            </Option>
          </MenuOptions>
          {
            selectedOption === 'BUY'
              ? (
                <BuyForm onSubmit={form.handleSubmit(buyBTC)}>
                  <FormDescription>
                    You can buy BTC from us directly to fund your lightning wallet
                  </FormDescription>
                  <Row>
                    <Column>
                      <TextInput {...form.register('USD')} placeholder="0.00" />
                      <Currency>USD</Currency>
                    </Column>
                    <ArrowIcon>
                      <Arrow />
                    </ArrowIcon>

                    <Column>
                      <TextInput {...form.register('BTC')} disabled placeholder="0.00" />
                      <Currency>BTC</Currency>
                    </Column>
                  </Row>
                  <PurchaseBTC type="submit" disabled={!form.getValues('USD')}>
                    PURCHASE BTC
                  </PurchaseBTC>
                </BuyForm>
              )
              : <></>
          }
        </FundingMenu>
        <SkipForNow onClick={() => network.setStatus(LightningStatus.CREATING_CHANNEL)}>
          SKIP FOR NOW
        </SkipForNow>
      </Body>
    </FundWallet>
  );
}
