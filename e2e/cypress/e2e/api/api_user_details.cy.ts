/* eslint-disable no-undef */
let token: any;
describe('API User Details...', () => {
  before(() => {
    cy.apiToken();
    cy.getCookie('_token')
      .should('exist')
      .then((t) => {
        token = t.value;
      });
  });

  it('should return current user profile', () => {
    cy.visit(Cypress.env('host'));
    cy.request({
      method: 'GET',
      url: `${Cypress.env("host")}/api/user-profile`,
      headers: {
        Authorization: `bearer ${token}`,
      }
    }).then((response) => {
      expect(response.body.data).to.have.property('email');
    });
  });
});