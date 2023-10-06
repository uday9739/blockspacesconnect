/* eslint-disable no-undef */
describe('User Notifications...', () => {
  before(() => {
    cy.apiToken();
    cy.getCookie('_token')
      .should('exist')
      .then((t) => {
        const token: string = t.value;
        // create new notification
        cy.request({
          method: "GET",
          url: `${Cypress.env("host")}/api/e2e/notification`,
          headers: {
            Authorization: `bearer ${token}`
          }
        })
          .its("status")
          .should("equal", 200);
      });
  });
  it('should notify the user', () => {
    cy.intercept(`${Cypress.env("host")}/api/notifications/user`).as("notifications");
    cy.login();
    cy.location('pathname').should('eq', '/connect');
    
    cy.wait('@notifications').its('response').then((response) => {
      expect(response.statusCode).to.eq(200);
    });
  });
});