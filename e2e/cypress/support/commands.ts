/* eslint-disable no-undef */
// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
import 'cypress-iframe';
import { login, logout } from "./ui_common";
import { apiToken, apiLogin, setUserFeatureFlag, toggleMaintenanceMode } from "./api_common";
import { cancelDeveloperEndpointAfterPurchase, cancelLightingService, purchaseStandardAndCompleteProfilePostLogin, purchaseStandardForNetworkServicePostLogin } from './stripe';

Cypress.Commands.addAll({
  login: login,
  logout: logout,
  apiToken: apiToken,
  apiLogin: apiLogin,
  purchaseStandardForNetworkServicePostLogin: purchaseStandardForNetworkServicePostLogin,
  cancelDeveloperEndpointAfterPurchase: cancelDeveloperEndpointAfterPurchase,
  cancelLightingService: cancelLightingService,
  setUserFeatureFlag: setUserFeatureFlag,
  purchaseStandardAndCompleteProfilePostLogin: purchaseStandardAndCompleteProfilePostLogin,
  toggleMaintenanceMode: toggleMaintenanceMode
});
Cypress.Commands.add('getStripeElement' as any, (fieldName) => {
  if (Cypress.config('chromeWebSecurity')) {
    throw new Error('To get stripe element `chromeWebSecurity` must be disabled');
  }

  const selector = `input[data-elements-stable-field-name="${fieldName}"]`;

  return cy
    .get('#cc-info-element iframe')
    .its('0.contentDocument.body').should('not.be.empty')
    .then(cy.wrap)
    .find(selector);
});