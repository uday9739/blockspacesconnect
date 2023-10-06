
const ethereum = "ethereum";
/* eslint-disable no-undef */
describe.skip('Network Endpoint', () => {
  beforeEach(() => {
    cy.login();
    cy.purchaseStandardForNetworkServicePostLogin(ethereum);
  });
  afterEach(() => {
    cy.cancelDeveloperEndpointAfterPurchase(ethereum);
    cy.logout();
  });


  it("should check endpoint...", () => {
    cy.get('[id="installed-ethereum"]').should("be.visible").click();
    cy.get('#add-endpoint-call-to-action').should("be.visible").click();
    cy.get('#lblEditableField').should("be.visible").click();
    cy.get('#txtEditableField').should("be.visible").clear().type('e2e Testing');
    cy.get('#btnSelectEndpoint').should("be.visible").click();
    cy.get('#btnSubmitTansaction').should("be.visible").click();
  });



});