import React, { useEffect, useMemo, useState } from 'react'
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useUIStore } from 'src/providers';
import AddCredential, {
  Form, Row, Submit, Subtitle, TextInput, Title, Response, GetMacaroon, GotIt,
} from './styles/add-credential';
import { SubmitHandler, useForm } from 'react-hook-form';
import { delay, each, includes } from 'lodash';
import { Network } from '@blockspaces/shared/models/networks';

type Props = {
  network: Network
}

interface IAddCredentialForm { password:string, verifyPassword:string }
const schema: yup.SchemaOf<IAddCredentialForm> = yup.object({
  password: yup.string().required('Password is required').min(8, 'Password must be at least 8 characters'),
  verifyPassword: yup.string().oneOf([yup.ref('password'), null], 'Passwords must match'),
});

export default function LIGHTNING_ADD_CREDENTIAL({ network }:Props) {
  const UI = useUIStore();

  const [submitting, setSubmitting] = useState(false);
  const [credentials, setCredentials] = useState('');
  const form = useForm<IAddCredentialForm>({
    mode: 'onTouched',
    criteriaMode: 'all',
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    UI.activeInfoTooltips.forEach((tooltip) => {
      if (
        tooltip.parentComponentName === 'AddCredentialForm'
        && !includes(Object.keys(form.formState.errors), tooltip.id)
      ) UI.removeInfoTooltip(tooltip.id);
    });
    each(form.formState.errors, (error, key) => {
      const tooltip = UI.activeInfoTooltips.find((tooltip) => tooltip.target === error.ref);
      if (!tooltip) {
        UI.addInfoTooltip({
          id: key,
          target: error.ref,
          parentComponentName: 'AddCredentialForm',
          position: 'right',
          label: error.message,
        });
      } else if (tooltip.label !== error.message) {
        UI.updateInfoTooltip(key, {
          id: key,
          target: error.ref,
          parentComponentName: 'AddCredentialForm',
          position: 'right',
          label: error.message,
        });
      }
    });
  }, [form.formState]);

  const submitCredentials: SubmitHandler<IAddCredentialForm> = async (registration) => {
    setSubmitting(true);
    setTimeout(() => {
      setCredentials('CREDENTIALS_GO_HERE');

      setSubmitting(false);
    }, 2000);
  };

  return (
    <AddCredential>
      { credentials
        ? (
          <Response>
            <Title>YOUR KEY IS READY</Title>
            <Subtitle>
              Here's your Macaroon, you'll need this
              {' '}
              <br />
              to access your Lightning Node
            </Subtitle>
            <GetMacaroon>DOWNLOAD KEY</GetMacaroon>
            <GotIt onClick={() => console.log('PROGRESS SIGNUP')}>GOT IT</GotIt>
          </Response>
        )
        : (
          <Form onSubmit={form.handleSubmit(submitCredentials)}>
            <Title>GENERATE CREDENTIALS</Title>
            <Subtitle>We'll need a password to get started</Subtitle>
            <Row>
              <TextInput type="password" {...form.register('password')} placeholder="PASSWORD" data-empty={!form.getValues('password')} autoComplete="off" />
            </Row>
            <Row>
              <TextInput type="password" {...form.register('verifyPassword')} placeholder="CONFIRM PASSWORD" data-empty={!form.getValues('verifyPassword')} autoComplete="off" />
            </Row>
            <Row style={{ marginTop: '1.25rem' }}>
              <Submit data-submitting={submitting} type="submit" disabled={submitting}>
                { submitting ? 'GENERATING CREDENTIALS' : 'SET PASSWORD' }
              </Submit>
            </Row>
          </Form>
        )}
    </AddCredential>
  );
}
