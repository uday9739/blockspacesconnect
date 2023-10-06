/* eslint-disable no-undef */
const totp = require("totp-generator");
const _path = require('path');

describe('Registration & 1st Login...', () => {
  it('should register a new user', () => {
    Cypress.session.clearAllSavedSessions();
    cy.clearAllCookies();
    cy.visit(Cypress.env('host') + '/auth?screen=sign-up');
    // Set the last user to purge
    cy.fixture('user.json').then((user) => {
      return cy.fixture('PurgeUsers.json').then((pu) => {
        const result: string[] = pu.data;
        result.push(user.email);
        return cy.writeFile(_path.join(__dirname, "../../fixtures/PurgeUsers.json"), { data: result, });
      });
    });

    // Create a Random email address for Creating a new user.
    const email = 'e2e+' + Cypress.env('environment') + Math.floor(Math.random() * 90 + 10) + Math.floor(Math.random() * 90 + 10) + "@blockspaces.com";
    cy.log(email);
    // Step 1 Populate Registation Form
    cy.get('[name=companyName]').should('be.visible').focus().type(`x`).clear().type('CompanyExample');
    cy.get('[name=email]').should('be.visible').focus().type(`x`).clear().type(email);
    cy.get('[name=firstName]').should('be.visible').focus().type(`x`).clear().type('testy');
    cy.get('[name=lastName]').should('be.visible').focus().type(`x`).clear().type('tester');
    cy.get('[name=phone]').should('be.visible').focus().clear('+1').type('+1 813 613 6321');
    cy.get('[name=address1]').should('be.visible').focus().type(`x`).clear().type('address1');
    cy.get('[name=address2]').should('be.visible').focus().type(`x`).clear().type('Address2');
    cy.get('[name=city]').should('be.visible').focus().type(`x`).clear().type('City');
    cy.get('[name=state]').should('be.visible').focus().type(`x`).clear().type('FL');
    cy.get('[name=zipCode]').should('be.visible').focus().type(`x`).clear().type('33786');
    cy.get('[name=password]').should('be.visible').focus().type(`x`).clear().type(Cypress.env('password'));
    cy.get('[name=verifyPassword]').should('be.visible').focus().type(`x`).clear().type(Cypress.env('password'));

    cy.intercept("post", `${Cypress.env("host")}/api/user-registration`).as('userReg');
    // DO Registration Click
    cy.get('[id="btnRegistrationSubmit"]').should('be.visible').click();
    cy.wait('@userReg');

    // cy.get('[id="btnContinueLogin"]').should('be.visible').click({force: true});

    cy.intercept("post", `${Cypress.env("host")}/api/auth/initial`).as('initial');

    // cy.get('[name=email]').should('be.visible').focus().type(`x`).clear().type(email); // Enter Email
    // cy.get('[name=password]').should('be.visible').focus().type(`x`).clear().type(Cypress.env('password')); // Enter Password



    cy.intercept("post", `${Cypress.env("host")}/api/auth/2fa/configure`).as('twoFa');

    // cy.get('[id="btnLogin"]').should('be.visible').click(); // Click Submit Login
    cy.wait('@initial');

    cy.wait('@twoFa')
      .its('response')
      .then((response) => {
        const _twoFASecret = response.body.data.secret;
        cy.log(`_twoFASecret :: ${_twoFASecret}`);
        // Now that we have the 2FA code, lets persist it.
        cy.writeFile(_path.join(__dirname, "../../fixtures/user.json"), {
          email: email,
          twoFASecret: _twoFASecret,
        });

        // Click to the 2FA screen
        cy.get('[id="btnContinueW2FA"]').should('be.visible').click({ force: true });

        // grab the result from the Login call to save Token.
        cy.intercept("post", `${Cypress.env("host")}/api/auth/login`).as('loggin');

        const twoFaCode: string = totp(_twoFASecret);
        // End 2FA code and complete login.
        cy.get('[name=code]').should('be.visible').focus().type(`x`).clear().type(twoFaCode).should('have.value', twoFaCode);
        cy.get('[type=submit]').should('be.visible').click();

        // Wait for result from login then update token fixture.
        return cy.wait('@loggin')
          .its('response')
          .then((response) => {
            if (response.statusCode >= 200 && response.statusCode < 300) {
              cy.setCookie("_token", response.body.data.userDetails.accessToken);
              cy.writeFile(_path.join(__dirname, "../../fixtures/token.json"), { accessToken: response.body.data.userDetails.accessToken });
              /* ==== Generated with Cypress Studio ==== */
              cy.get('[id="btnToSAccept"').should('be.visible').click();
              //cy.get('[id="btnWelcomeIntro"').should('be.visible').click();
              cy.get('[id="btnCancel"]').should('be.visible').click();
            } else {
              // Login Failed.
              cy.log(response.body.data.failureMessage);
            }
          });
      });
  });
});

