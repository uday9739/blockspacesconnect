/* eslint-disable no-undef */
describe(' maintenance mode.', () => {
  beforeEach(() => { });
  afterEach(() => {

  });

  it('should go into  maintenance mode.', () => {

    Cypress.session.clearAllSavedSessions();
    cy.clearAllCookies();
    cy.toggleMaintenanceMode(true);
    cy.intercept("get", `${Cypress.env("host")}/api/platform/status/detailed`).as('status');

    cy.visit(Cypress.env('host') + '/connect');
    cy.intercept('GET', `${Cypress.env("host")}/api/auth/revoke-token`, {
      statusCode: 200
    });
    cy.wait(1000);

    cy.wait('@status')
      .its('response')
      .then((response) => {
        const maintenanceMode = response.body.data.maintenanceMode;
        expect(maintenanceMode === "maintenance").to.be.true;
      });
    cy.get("#scheduledmaintenancemode").should('be.visible');
  });

  it('should go out of maintenance mode.', () => {

    Cypress.session.clearAllSavedSessions();
    cy.clearAllCookies();
    cy.toggleMaintenanceMode(false);
    cy.intercept("get", `${Cypress.env("host")}/api/platform/status/detailed`).as('status');
    cy.visit(Cypress.env('host') + '/connect');
    cy.intercept('GET', `${Cypress.env("host")}/api/auth/revoke-token`, {
      statusCode: 200
    });
    cy.wait(1000);

    cy.wait('@status')
      .its('response')
      .then((response) => {
        const maintenanceMode = response.body.data.maintenanceMode;
        expect(maintenanceMode === "maintenance").to.be.false;
      });
    cy.get("#login-form").should('be.visible');

  });
});
