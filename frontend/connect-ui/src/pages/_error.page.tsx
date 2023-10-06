import NextErrorComponent from 'next/error';
import React from 'react';
import type { ErrorProps } from 'next/error';
import type { NextPage } from 'next';
import { ErrorFallback } from '@errors';
import {useRouter} from 'next/router';

const AppError: NextPage<ErrorProps> = ({
  statusCode, title
}) =>
{

  const router = useRouter()
  return <ErrorFallback error={ title } statusCode={ statusCode } resetErrorBoundary={ ()=> {if(router?.isReady){ router.push('/') }} } />;
};

AppError.getInitialProps = async ({ res, err }) =>
{
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404
  const title = 'server error'
  // TODO: This will contain the status code of the response, this still needs to be tested, seems to work. alternatively can throw an error.
  return {statusCode, title };
};

export default AppError;
