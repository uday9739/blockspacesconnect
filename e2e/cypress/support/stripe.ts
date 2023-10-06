/* eslint-disable no-undef */

export function purchaseStandardForNetworkServicePostLogin(networkId: string) {
  const PlanTier = networkId !== 'lightning' ? 'Standard' : 'Professional';
  function cartSessionPollingHelper(resolve) {
    cy.wait('@cartSession').then(({ request, response }) => {
      if (response.body.data.status === "CHECKOUT_COMPLETE") return resolve();
      return cartSessionPollingHelper(resolve);
    });
  }
  cy.intercept('POST', `${Cypress.env("host")}/api/cart`).as('iniCart');
  /**
   * Select Network
   */
  cy.get(`#select-${networkId}`)
    .click()
    .wait('@iniCart')
    .then(({ request, response }) => {
      const cartId = response.body.data.cart.id;
      cy.intercept('GET', `${Cypress.env("host")}/api/cart/${cartId}`).as('cartSession');
      cy.intercept('POST', `${Cypress.env("host")}/api/cart/${cartId}/add-billing-info`).as('addBillingInfo');
      cy.intercept('GET', `${Cypress.env("host")}/api/users/current`).as('currentUser');

    });
  /**
   * Select Plan
   */
  cy.get(`#select-plan-${PlanTier}`).click();
  /**
 * Add Billing Info
 */
  cy.get('#billingAddressIsSameAsProfile').check();
  cy.get('#btnSubmitBillingInfo').click();
  cy.wait('@addBillingInfo');
  /**
   * Add CC Info
   */
  cy.getStripeElement('cardNumber').type('4242424242424242');
  cy.getStripeElement('cardExpiry').type('1133');
  cy.getStripeElement('cardCvc').type('123');
  cy.get('#btnAddPayment').click();
  /**
   * Polling waiting for checkout complete
   */
  new Cypress.Promise((resolve, reject) => cartSessionPollingHelper(resolve));
  /**
   * Checkout Completed
   */
  // cy.get('#add-success').should('be.visible');
  // cy.get('#btnContinue').click();
  cy.wait("@currentUser").then(({ request, response }) => {
    const user = response.body.data;
    expect(user?.billingDetails?.stripe?.customerId).to.not.be.null;
    // expect(user?.connectedNetworks?.length > 0).to.be.true;
  });

}

export function purchaseStandardAndCompleteProfilePostLogin(networkId: string) {
  const PlanTier = networkId !== 'lightning' ? 'Standard' : 'Professional';

  function cartSessionPollingHelper(resolve) {
    cy.wait('@cartSession').then(({ request, response }) => {
      if (response.body.data.status === "CHECKOUT_COMPLETE") return resolve();
      return cartSessionPollingHelper(resolve);
    });
  }

  cy.intercept('POST', `${Cypress.env("host")}/api/cart`).as('iniCart');
  cy.get(`#select-${networkId}`)
    .click()
    .wait('@iniCart')
    .then(({ request, response }) => {
      const cartId = response.body.data.cart.id;
      cy.intercept('GET', `${Cypress.env("host")}/api/cart/${cartId}`).as('cartSession');
      cy.intercept('POST', `${Cypress.env("host")}/api/cart/${cartId}/add-billing-info`).as('addBillingInfo');
      cy.intercept('GET', `${Cypress.env("host")}/api/users/current`).as('currentUser');
    });
  cy.get(`#select-plan-${PlanTier}`).click();
  /**
   * Complete Profile
   */
  cy.intercept('PATCH', `${Cypress.env("host")}/api/user-profile`).as('updateProfile');
  cy.get('[name=companyName]').should('be.visible').focus().type(`x`).clear().type('CompanyExample');
  cy.get('[name=firstName]').should('be.visible').focus().type(`x`).clear().type('testy');
  cy.get('[name=lastName]').should('be.visible').focus().type(`x`).clear().type('tester');
  cy.get('[name=phone]').should('be.visible').focus().clear('+1').type('+1 813 613 6321');
  cy.get('[name=address1]').should('be.visible').focus().type(`x`).clear().type('address1');
  cy.get('[name=address2]').should('be.visible').focus().type(`x`).clear().type('Address2');
  cy.get('[name=city]').should('be.visible').focus().type(`x`).clear().type('City');
  cy.get('[name=state]').should('be.visible').focus().type(`x`).clear().type('FL');
  cy.get('[name=zipCode]').should('be.visible').focus().type(`x`).clear().type('33786');

  cy.get('#btnSveUserProfile').click();
  cy.wait('@updateProfile');

  /**
   * Billing Info
   */
  cy.get('#billingAddressIsSameAsProfile').check();
  cy.get('#btnSubmitBillingInfo').click();
  cy.wait('@addBillingInfo');
  /**
   * CC info
   */
  cy.getStripeElement('cardNumber').type('4242424242424242');
  cy.getStripeElement('cardExpiry').type('1133');
  cy.getStripeElement('cardCvc').type('123');
  cy.get('#btnAddPayment').click();
  /**
   * Polling waiting for checkout complete
   */
  new Cypress.Promise((resolve, reject) => cartSessionPollingHelper(resolve));
  /**
   * Checkout Completed
   */
  // cy.get('#add-success').should('be.visible');
  // cy.get('#btnContinue').click();
  cy.wait("@currentUser").then(({ request, response }) => {
    const user = response.body.data;
    expect(user?.billingDetails?.stripe?.customerId).to.not.be.null;
    // expect(user?.connectedNetworks?.length > 0).to.be.true;
  });
}

export function cancelDeveloperEndpointAfterPurchase(networkId: String) {

  cy.visit(Cypress.env("host") + "/connect");
  cy.get(`#installed-${networkId}`).should('be.visible').click({force:true});
  cy.intercept('POST', `${Cypress.env("host")}/api/connect-subscription/cancel/${networkId}/**`).as('cancelSub');
  cy.intercept('GET', `${Cypress.env("host")}/api/users/current`).as('currentUser');
  cy.intercept('GET', `${Cypress.env("host")}/api/connect-subscription`).as('subscription');

  cy.get(`#link-open-plan-overview-cancel`).should('be.visible').click({force:true});
  cy.get(`#btnSubmitCancel`).should('be.visible').click({force:true});


  cy.wait([`@cancelSub`, "@currentUser", '@subscription']).then((interceptions) => {
    // interceptions[1] <-- currentUser
    // interceptions[2] <-- subscription

    // const user = interceptions[1].response.body.data;
    // if (Cypress.env("host") !== "https://localhost") {
    //   expect(user?.billingDetails?.quickbooks?.customerRef?.name).to.not.be.null;
    // }

    // const subscriptionStatus = interceptions[2].response.body.data.status;
    // expect(subscriptionStatus).to.eq("Inactive");

  });


}

export function cancelLightingService() {
  cy.apiToken();
  cy.getCookie('_token')
    .should('exist')
    .then((t) => {
      const token = t.value;
      return cy.request({
        failOnStatusCode: false,
        method: 'POST',
        url: Cypress.env('host') + `/api/connect-subscription/cancel/lightning/MultiWebApp/Professional`,
        headers: {
          Authorization: `bearer ${token}`,
        }
      });
    });

  // cy.intercept('GET', `/api/users/current`).as('currentUser');
  // cy.intercept('GET', `/api/connect-subscription`).as('subscription');
  // cy.visit(Cypress.env("host") + "/connect");
  // cy.get("#add-app #btnCancel").click();
  // cy.wait(["@currentUser", '@subscription']).then((interceptions) => {
  //   // interceptions[0] <-- currentUser
  //   // interceptions[1] <-- subscription
  //   const subscriptionStatus = interceptions[1].response.body.data.status;
  //   expect(subscriptionStatus).to.eq("Inactive");
  // });
  // cy.wait(500);

}