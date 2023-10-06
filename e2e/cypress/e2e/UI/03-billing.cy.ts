/* eslint-disable no-undef */
import 'cypress-plugin-stripe-elements';
import 'cypress-react-selector';

const ethereum = "ethereum";

describe.skip('billing module...', () => {
  beforeEach(() => {
    cy.login();
    cy.setUserFeatureFlag("billingModule");
    cy.purchaseStandardForNetworkServicePostLogin(ethereum);
  });
  afterEach(() => {
    cy.cancelDeveloperEndpointAfterPurchase(ethereum);
    cy.logout();
  });

  it('add new CC', () => {
    // open billing page via menu
    cy.intercept('GET', `${Cypress.env("host")}/api/connect-subscription`)
      .as('subscription');
    cy.intercept('GET', `${Cypress.env("host")}/api/connect-subscription/invoices*`)
      .as('invoices');
    cy.get('#user-menu-container [data-testid="AccountCircleIcon"]').click({ force: true });
    cy.get('#billing-module-menu-item').click({ force: true });

    // wait for billing data to load
    cy.wait(["@subscription", "@invoices"]).then((interceptions) => {
      // interceptions[0] <-- subscription
      // interceptions[1] <-- paymentMethods
      const invoices = interceptions[1].response.body.data.data;
      // confirm new addition
      expect(invoices?.length > 0).to.be.true;
    });

    // confirm Subscription Status is active
    cy.get(`#ConnectSubscriptionStatusActive`).should('be.visible');
    // confirm newly added service is active
    cy.get(`#${ethereum}-active`).should('be.visible');
    // add new CC & set as default
    cy.get('#btn-add-new-cc').click();
    cy.get('#billingAddressIsSameAsProfile').click();
    cy.get('#set-cc-as-default').click();
    // enter test CC #
    cy.intercept('POST', `${Cypress.env("host")}/api/connect-subscription/payment-methods/attach`)
      .as('paymentAttach');
    cy.intercept('GET', `${Cypress.env("host")}/api/connect-subscription/payment-methods`)
      .as('paymentMethods');
    cy.getStripeElement('cardNumber').type('4242424242424242');
    cy.getStripeElement('cardExpiry').type('1133');
    cy.getStripeElement('cardCvc').type('123');
    cy.get('#btn-modal-container-primary-action').click();
    // wait for data to refetch
    cy.wait(["@paymentAttach", "@paymentMethods"]).then((interceptions) => {
      // interceptions[0] <-- paymentAttach
      // interceptions[1] <-- paymentMethods
      const paymentMethodId = interceptions[0].request.body.paymentMethodId;
      // confirm new addition
      cy.get(`#default-pm-${paymentMethodId}`).should('be.visible');
    });

  });
  it('Change Default CC', () => {
    // open billing page via menu
    cy.intercept('GET', `${Cypress.env("host")}/api/connect-subscription/payment-methods`)
      .as('paymentMethods');
    cy.get('#user-menu-container [data-testid="AccountCircleIcon"]').click({ force: true });
    cy.get('#billing-module-menu-item').click({ force: true });

    // wait for billing data to load
    cy.wait(["@paymentMethods"]);

    // test changing default
    cy.intercept('POST', `${Cypress.env("host")}/api/connect-subscription/payment-methods/set-default-payment-method`)
      .as('setPaymentAsDefault');

    cy.get('#pm-container-1').then(($div) => {
      const isDefault = $div.data("is-default");
      expect(isDefault).be.false;
    });

    cy.intercept('GET', `${Cypress.env("host")}/api/connect-subscription/payment-methods`)
      .as('paymentMethods');
    cy.get("#pm-container-1 #set-pm-as-default-1").click();
    cy.get('#btnConfirmDialogConfirm').click();

    // wait for data to refetch
    cy.wait(["@setPaymentAsDefault", "@paymentMethods"]).then((interceptions) => {
      // interceptions[0] <-- setPaymentAsDefault
      // interceptions[1] <-- paymentMethods
      const paymentMethodId = interceptions[0].request.body.paymentMethodId;
      // confirm new addition
      cy.get(`[data-pm-id='${paymentMethodId}'`).then(($div) => {
        // const isDefault = $div.data("is-default");
        // expect(isDefault).be.true;
      });
    });
  });

  it('Delete CC', () => {
    // open billing page via menu
    cy.intercept('GET', `${Cypress.env("host")}/api/connect-subscription/payment-methods`)
      .as('paymentMethods');
    cy.get('#user-menu-container [data-testid="AccountCircleIcon"]').click({ force: true });
    cy.get('#billing-module-menu-item').click({ force: true });

    // wait for billing data to load
    cy.wait(["@paymentMethods"]);

    // test delete CC
    cy.get('#pm-container-1').then(($div) => {
      const pmId = $div.data("pm-id");
      // const isDefault = $div.data("is-default");
      // expect(isDefault).be.false;

      cy.intercept('DELETE', `${Cypress.env("host")}/api/connect-subscription/payment-methods/${pmId}`)
        .as('deletePayment');

    });

    cy.intercept('GET', `${Cypress.env("host")}/api/connect-subscription/payment-methods`)
      .as('paymentMethods');
    cy.get("#pm-container-1 #delete-pm-1").click();
    cy.get('#btnConfirmDialogConfirm').click();

    cy.wait(["@deletePayment", "@paymentMethods"]).then((interceptions) => {
      // interceptions[0] <-- deletePayment
      // interceptions[1] <-- paymentMethods
      const result = interceptions[0].response.body.data;
      expect(result).be.true;
    });
  });
});
