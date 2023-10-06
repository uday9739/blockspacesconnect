/* eslint-disable no-undef */
const jwt = require('jsonwebtoken');
const totp = require("totp-generator");
const path = require('path');
/**
 * Make sure the API Token is valid.
 */
export function apiToken(): void {
  // Check for valid token
  cy.fixture('token.json').then((_token) => {
    // If Token.json is not found login and create it.
    if (!_token) {
      apiLogin();
    } else {
      try {
        // Check that token has not expired.
        const decoded = jwt.decode(_token.accessToken);
        // console.log(decoded.exp);
        // console.log(Date.now() / 1000);
        if (decoded.exp < Date.now() / 1000) {
          apiLogin();
        } else {
          cy.setCookie("_token", _token.accessToken);
        }
      } catch (error) {
        cy.log(error.message);
        expect(error.status).to.eq(200);
      }
    }
  });
}

/**
 * Get the API Token from Core.
 */
export function apiLogin(): void {
  let cookie: string | string[];
  let token: string;
  console.log("Login");
  cy.intercept('GET', `${Cypress.env("host")}/api/auth/revoke-token`, {
    statusCode: 200
  });
  cy.fixture('user.json').then((data) => {
    // console.log(data.email);
    // console.log(data.twoFASecret);
    // console.log(totp(data.twoFASecret));

    // Check the 2fa code. if code matches saved code then we have to wait 30 seconds for the next TOTP code.
    let _twoFaCodeResult: string;
    cy.fixture("lastTwoFaCode.json").then((last) => {
      const twoFaCode: string = totp(data.twoFASecret);
      const lastTwoFaCode: string = last.lastTwoFaCode;
      cy.log(`lastTwoFaCode: ${lastTwoFaCode}`);
      cy.log(`newTwoFaCode: ${twoFaCode}`);
      if (lastTwoFaCode === twoFaCode) {
        cy.log("codes Match wait 30 second for next cycle");
        cy.wait(30000).then(() => {
          const newNewTwoFaCode = totp(data.twoFASecret);
          cy.log(`newNewTwoFaCode: ${newNewTwoFaCode}`);
          _twoFaCodeResult = newNewTwoFaCode;
        });
      } else {
        _twoFaCodeResult = twoFaCode;
      }
      // Write the last used 2Fa to file.
      cy.writeFile(path.join(__dirname, "../fixtures/lastTwoFaCode.json"), { lastTwoFaCode: _twoFaCodeResult })
        .then(() => {
          // Do initial login
          cy.request({
            method: "POST",
            url: `${Cypress.env("host")}/api/auth/initial`,
            body: {
              email: data.email,
              password: Cypress.env("password")
            }
          }).then((response) => {
            cookie = response.headers["set-cookie"];
            // Do login
            cy.request({
              method: "POST",
              url: `${Cypress.env("host")}/api/auth/login`,
              headers: {
                cookie: cookie
              },
              body: {
                email: data.email,
                password: Cypress.env("password"),
                code: _twoFaCodeResult,
                cookie: true
              }
            }).then((response) => {
              if (response.status >= 400) {
                cy.wait(30000).then(() => {
                  apiLogin();
                });
              }
              token = response.body.data.userDetails.accessToken;
              cy.setCookie("_token", token);
              cy.writeFile(path.join(__dirname, "../fixtures/token.json"), { accessToken: token });
            });
          });
        });
    });
  });
}

export function setUserFeatureFlag(flagName: string) {
  cy.apiToken();
  cy.getCookie('_token')
    .should('exist')
    .then((t) => {
      const token = t.value;
      cy.request({
        method: 'POST',
        url: `${Cypress.env("host")}/api/users/set-feature-flag`,
        body: { flagName },
        headers: {
          Authorization: `bearer ${token}`,
        }
      });
    });
}
export function toggleMaintenanceMode(value: boolean) {
  cy.apiToken();
  cy.getCookie('_token')
    .should('exist')
    .then((t) => {
      const token = t.value;
      cy.request({
        method: 'POST',
        url: `${Cypress.env("host")}/api/e2e/toggle-maintenance-mode`,
        body: { value },
        headers: {
          Authorization: `bearer ${token}`,
        }
      });
    });
}