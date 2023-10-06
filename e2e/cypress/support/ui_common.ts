/* eslint-disable no-undef */
const totp = require("totp-generator");
const path = require('path');

/**
 * Create new login session for reuseage. this session works with all UI specs that use cy.login()
 *
 * @param name if provided a unique session for the test will be created.
 * @default cy.login(); default usage is for all specs to share the mainSession.
 *          cy.login('###'); creates a new login session for testing in isolation
 */
export function login(name: string = 'mainSession'): void {
  cy.session(name, () => {
    loginProcess();
    // cy.url().should('contain', '/connect');
  },
    {
      cacheAcrossSpecs: true, // Allows session to be used by all specs.
    });
  cy.visit(`${Cypress.env("host")}/connect`);
};

/** Does the work of logging in. */
function loginProcess(): void {

  cy.visit(Cypress.env("host"));
  cy.intercept('GET', `${Cypress.env("host")}/api/auth/revoke-token`, {
    statusCode: 200
  });
  cy.fixture('user.json').then((userData) => {
    cy.wait(1000);
    let userEmail: string = "";
    let user2FaSecret: string = "";
    let lastTwoFaCode: number = 0;
    let twoFaCode: number = 0;

    userEmail = userData.email;
    user2FaSecret = userData.twoFASecret;

    cy.fixture("lastTwoFaCode.json").then((last) => {
      cy.wait(1000);
      lastTwoFaCode = Number(last.lastTwoFaCode);
      twoFaCode = Number(totp(user2FaSecret, { digits: 6 }));
      if (twoFaCode.toString().length !== 6) {
        cy.log(`totp-generator failed to render correct. Code must be 6 digits: ${twoFaCode}. Starting Login process over.`)
          .wait(30000);
        loginProcess();
      } else {
        cy.log(`Last code(${lastTwoFaCode.toString()}) ~ Current code(${twoFaCode.toString()})`);
        if (twoFaCode === lastTwoFaCode) {
          cy.log(`Codes Match wait 30 second before starting process over.`)
            .wait(30000);
          loginProcess();
        } else {
          cy.writeFile(path.join(__dirname, "../fixtures/lastTwoFaCode.json"), { lastTwoFaCode: twoFaCode.toString() })
            .then(() => {
              cy.intercept("post", `${Cypress.env("host")}/api/auth/initial`).as('initial');
              cy.get("[name=email]").should('be.visible').focus().type(`x`).clear().type(userEmail); // Enter Email
              cy.get("[name=password]").should('be.visible').focus().type(`x`).clear().type(Cypress.env("password")); // Enter Password
              cy.get('[id="btnLogin"]').should('be.visible').click(); // Click Submit Login
              cy.wait('@initial');

              cy.intercept("post", `${Cypress.env("host")}/api/auth/login`).as('login');

              cy.get("[name=code]").should('be.visible').focus().type(`1`).clear().wait(200).type(twoFaCode.toString()).should('have.value', twoFaCode.toString());
              cy.get('[id="btnConfirm2FA"]').should('be.visible').click(); // DO Login

              cy.wait("@login")
                .its('response')
                .then((response) => {
                  if (response.statusCode >= 400) {
                    switch (response.statusCode) {
                      case 400:
                        cy.log(`Status ${response.statusCode} ${response.statusMessage}`)
                          .log(`Waiting for API before restarting process. 2fa(${twoFaCode.toString()})`)
                          .wait(5000);
                        break;
                      case 401:
                        cy.log(`Status ${response.statusCode} ${response.body.data.failureReason}`)
                          .log(`Waiting for Vault before restarting process. last(${lastTwoFaCode}) = current(${twoFaCode.toString()})`)
                          .wait(30000);
                        break;
                      default:
                        cy.log(`Status ${response.statusCode} ${response.body.data.failureReason}`);
                        break;
                    }
                    loginProcess();
                  } else {
                    cy.setCookie("_token", response.body.data.userDetails.accessToken);
                  }
                });
            });
        } // if (twoFaCode === lastTwoFaCode)
      } // if(twoFaCode.toString().length !== 6)
    }); // cy.fixture("lastTwoFaCode.json").then((last)
  });
}

/**
 * Global Logout
 */
export function logout(): void {
  cy.visit(Cypress.env('host') + '/logout');
  cy.intercept('GET', `${Cypress.env("host")}/api/auth/revoke-token`, {
    statusCode: 200
  });
};
