/* eslint-disable no-undef */
describe('Purge E2E Test Users...', () => {
  let token: any;
  before(() => {
    cy.apiToken();
    cy.getCookie('_token')
      .should('exist')
      .then((t) => {
        token = t.value;
      });
  });
  it('should purge test users from system', () => {
    cy.visit(Cypress.env('host'));
    cy.fixture('PurgeUsers.json').then((pu) => {
      const data: string[] = pu.data;
      cy.request({
        method: 'POST',
        url: `${Cypress.env("host")}/api/e2e/purgeE2E`,
        body: data,
        headers: {
          Authorization: `bearer ${token}`,
        }
      })
        .its("status")
        .should("equal", 201);
    });
  });
});
