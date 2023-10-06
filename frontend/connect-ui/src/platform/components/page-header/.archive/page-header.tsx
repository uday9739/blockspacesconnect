import Head from 'next/head';
import React from 'react';

export type HeaderProps = {
  title?: string
}

/**
 * Defines the `<head>` portion of a page
 */
export const PageHeader: React.FC<React.PropsWithChildren<HeaderProps>> = ({ title, children }) => (
  <>
  <Head>
    <meta property="og:title" content={`Blockspaces`+ title ? `- ${title}` : ''} key="title" />
    {children}
  </Head>
  </>
);
