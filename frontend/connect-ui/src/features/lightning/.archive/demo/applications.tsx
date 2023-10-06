import { Icons } from "src/platform/components";
import React from "react";

const { Plus } = Icons;

import Applications, { AddApp, App, AppLogo, Apps, SectionTitle } from './styles/applications';

function APPLICATIONS() {
  return (
    <Applications>
      <SectionTitle>INSTALLED APPLICATIONS</SectionTitle>
      <Apps>
        <App>
          <AppLogo style={{ margin: "-.375rem 0 0 .125rem" }} src="/images/btcpay-server.png" />
        </App>
        <App>
          <AppLogo src="/images/sphinx.png" />
        </App>
        <AddApp>
          <Plus />
        </AddApp>
      </Apps>
    </Applications>
  );
}

export default APPLICATIONS;
