/* eslint-disable no-undef */
describe('User Settings...', () => {
  it('should update user profile.', () => {
    cy.login();
    cy.get('[id="btnCancel"]').should('be.visible').click();
    cy.get('[data-testid="AccountCircleIcon"]').should('be.visible').click();
    cy.get('[id="user-settings-menu-item"]').should('be.visible').click();
    cy.get('[name="address2"]').should('be.visible').focus().type(`x`).clear().type('New Address');
    cy.get('[name="firstName"]').should('be.visible').focus().type(`x`).clear().type('Rodger');
    cy.get('[name="lastName"]').should('be.visible').focus().type(`x`).clear().type('Dodger');
    cy.get('#btn-modal-container-primary-action').should('be.visible').click();
    cy.logout();
  });
});