/* eslint-disable no-undef */
describe('API Login...', () => {

  it('should check Bearer Token', () => {
    cy.visit(Cypress.env('host'));
    cy.apiLogin();
    // expect("accessToken").to.be.string;
  });
});
