/* eslint-disable no-undef */
describe(`Lightning...`, () => {
  beforeEach(() => {
    cy.login();
    cy.location('pathname').should('eq', '/connect');
  });
  afterEach(() => {
    cy.logout();
  });

  it("should purchase...", () => {
    cy.purchaseStandardForNetworkServicePostLogin(`lightning`);
    cy.wait(1000);
    // cy.get('#add-success').should('be.visible');
    // cy.get('#btnContinue').click();
  });

  it("should onboard...", () => {
    /** Wipe and reset e2eNode... */
    cy.apiToken();
    cy.getCookie('_token')
      .should('exist')
      .then((t) => {
        const token: string = t.value;
        // wipe node
        cy.request({
          method: "GET",
          url: `${Cypress.env("host")}/api/e2e/resetE2ENode`,
          headers: {
            Authorization: `bearer ${token}`
          }
        }).its("status").should("equal", 200);

        /** Claim e2eNode... */
        cy.intercept("GET", "https://tate.ln.blockspaces.com/v1/genseed").as("genSeed");

        cy.get('#installed-lightning').should("be.visible").click();
        cy.get('[id="btnGetStarted"]').should("be.visible").click();
        cy.get('[id="btnNextStep"]').should("be.visible").click();
        cy.wait("@genSeed")
          .its("response")
          .then((response) => {
            /** Loop the cipher to populate seeding */
            const cipher: string[] = response.body.cipher_seed_mnemonic;
            cy.wait(1000);
            for (const value of cipher) {
              cy.get(`[data-code="${value}"]`).should("be.visible").click({ multiple: true });
            }
            /** Set Node Password and Sync with LNC... */
            cy.get('[id="btnContinue"]').should('be.visible').click();
            cy.get('[name="nodePassword"]').should('be.visible').clear();
            cy.get('[name="nodePassword"]').should('be.visible').type(Cypress.env('password'));
            cy.get('[name="verifyNodePassword"]').should('be.visible').clear();
            cy.get('[name="verifyNodePassword"]').should('be.visible').type(Cypress.env('password'));

            cy.get('[name="confirmToggle"]').check();


            // set password
            cy.get('[id="btnLncPassword"]').should('be.visible').click();
            // start LNC sync
            cy.get('[id="btnLncSyncing"]').should('be.visible').click();
            // Set Liquidity
            // cy.get('[id="btnSubmit"]').should('be.visible').click();
            // cy.get('[data-testid="CloseIcon"]').should('be.visible').click();
          });
        // regenerate the 6 blocks
        cy.request({
          method: "GET",
          url: `${Cypress.env("host")}/api/e2e/blocks`,
          headers: {
            Authorization: `bearer ${token}`
          }
        }).its("status").should("equal", 200);
      });
    cy.wait(1000);



  });

  it("should toggle SATs to USD display...", () => {
    cy.get('#installed-lightning').should("be.visible").click();
    cy.intercept("GET", `${Cypress.env("host")}/api/users/current`).as("current");
    cy.visit(`${Cypress.env("host")}/multi-web-app/lightning/settings`);
    cy.wait("@current");

    cy.intercept("PATCH", `${Cypress.env("host")}/api/users/settings`).as("settings");
    cy.get('#chkChangeCurrency').check({ force: true });
    cy.wait("@settings")
      .then(({ request, response }) => {
        expect(response.body.data.appSettings.bip.displayFiat).to.equal(true);
      });
  });

  it("should toggle USD to SATs display...", () => {
    cy.intercept("GET", `${Cypress.env("host")}/api/users/current`).as("current");
    cy.get('#installed-lightning').should("be.visible").click();
    cy.visit(`${Cypress.env("host")}/multi-web-app/lightning/settings`);
    cy.wait("@current");

    cy.intercept("PATCH", `${Cypress.env("host")}/api/users/settings`).as("settings");
    cy.get('#chkChangeCurrency').uncheck({ force: true });

    cy.wait("@settings")
      .then(({ request, response }) => {
        expect(response.body.data.appSettings.bip.displayFiat).to.equal(false);
      });
  });

  it.skip("should recieve money...", () => {
    cy.intercept("GET", `${Cypress.env("host")}/api/users/current`).as("current");
    cy.visit(`${Cypress.env("host")}/connect`);
    cy.get('#installed-lightning').should("be.visible").click();
    let tenantId: string = "";
    cy.wait("@current")
      .its("response")
      .then((response) => {
        cy.get('#lblSuperchannelInfo').should('have.text', 'ACTIVE');
        tenantId = response.body.data.tenants[0];
        cy.visit(`${Cypress.env("host")}/multi-web-app/lightning/pos?tenantid=${tenantId}`).as("pos");
      });

    cy.intercept("POST", `${Cypress.env("host")}/api/networks/lightning/invoice/quote`).as("quote");
    cy.intercept("GET", `${Cypress.env("host")}/api/networks/lightning/invoice`).as("invoice");
    cy.get('#2').click();
    cy.get('#5').click();
    cy.get('#0').click();
    cy.get('#0').click();
    cy.get("#btnBoltPos").click();
    cy.wait("@quote")
      .its("response")
      .then((response) => {
        if (response.body.status === 'failed') {
          cy.log(response.body.message);
        } else {
          const paymentRequest: string = response.body.data.paymentRequest;
          const data = {
            "payment_request": paymentRequest,
            "timeout_seconds": 5000
          };
          cy.apiToken();
          cy.getCookie('_token')
            .should('exist')
            .then((t) => {
              const token: string = t.value;
              cy.request({
                method: "POST",
                url: `${Cypress.env("host")}/api/e2e/payment`,
                headers: {
                  Authorization: `bearer ${token}`
                },
                body: data
              }).its("status").should("equal", 201);
              cy.wait(3000);
              // cy.get('[id="btnPaymentSuccessful"]', { timeout: 30000 }).should("be.visible").click();
            });
        }
      });

  });

  it.skip("should send money...", () => {
    cy.apiToken();
    cy.getCookie('_token')
      .should('exist')
      .then((t) => {
        const token: string = t.value;
        cy.request({
          method: "GET",
          url: `${Cypress.env("host")}/api/e2e/invoice`,
          headers: {
            Authorization: `bearer ${token}`
          }
        }).then((response) => {
          if (response.body.status === 'failed') {
            cy.log(response.body.message);
          } else {
            cy.log(response.body.data);
            // expect(response.status).to.eq(200);
            cy.get('#installed-lightning').should("be.visible").click();
            cy.get('[id="btnSendMoney"]').should("be.visible").click();
            cy.get('[name="paymentInput"]')
              .clear()
              .type(response.body.data);
            cy.get('[id="btnSubmitPayment"]').should("be.visible").click();
          }
        });
      });
  });

  it.skip("should connect Quickbooks...", () => {
    cy.get('#installed-lightning').should("be.visible").click();
    cy.visit(`${Cypress.env("host")}/multi-web-app/lightning/connections`);
    cy.get('[id="btnQuickBooks"]').should('be.visible').click();
    cy.get('[id="btnConnectAccounts"]').should('be.visible').click();
    cy.get('[data-testid="UsernamePasswordSignInUserIdInput"]').clear().type('Customer');
    cy.get('[data-testid="UsernamePasswordSignInPasswordInput"]').clear().type('STEd0@LnA1lSWAz23?l#');
  });

  it.skip("should dashboard...", () => {
    cy.get('#installed-lightning').should("be.visible").click();

    /* ==== Generated with Cypress Studio ==== */
    // cy.get('.sc-64fd3eb2-3').should('have.text', '10,441,326');
    // cy.get(':nth-child(2) > :nth-child(2) > .sc-5ab1436b-3').should('have.text', '10.4m');
    // cy.get(':nth-child(4) > :nth-child(2) > .sc-5ab1436b-3').should('have.text', '10.4m');
    // cy.get('.sc-4563cd21-8').should('have.text', '10,441,326');
    // cy.get('.sc-4563cd21-6').should('have.text', 'CompanyExample via BlockSpaces ⚡️');
    /* ==== End Cypress Studio ==== */
  });


  it("should cancel...", () => {
    cy.cancelLightingService();
  });
});
