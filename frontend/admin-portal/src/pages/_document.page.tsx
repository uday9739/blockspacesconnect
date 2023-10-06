import Document, { Head, Html, Main, NextScript } from "next/document";

export default class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" />
          <link href="https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700&family=Roboto+Mono&display=swap" rel="stylesheet" />
        </Head>
        <body>
          <Main />
          <NextScript />
          <div id="admin-portal-root"  />
        </body>
      </Html>
    );
  }
}
