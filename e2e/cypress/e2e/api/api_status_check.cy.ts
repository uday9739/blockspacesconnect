/* eslint-disable no-undef */
let accessToken;

describe('API Status Check...', () => {
  before(() => {
    cy.apiToken();
    cy.getCookie('_token')
      .should('exist')
      .then((token) => {
        accessToken = token.value;
      });
  });
  it('should be responding', () => {
    cy.visit(Cypress.env('host'));
    // Log tested URL to console
    cy.log(`URL Tested: ${Cypress.env("host")}/api`);
    // Make call to API
    cy.request(Cypress.env('host') + "/api")
      .then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('status').to.eq("success");
        expect(response.body).to.have.property('data').to.eq("Server is live");
      });
  });

  it('should check Bearer Token', () => {
    expect(accessToken).to.be.string;
  });
});