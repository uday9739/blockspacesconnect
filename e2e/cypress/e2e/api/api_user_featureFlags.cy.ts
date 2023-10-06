/* eslint-disable no-undef */
let _token;

describe('API Feature Flags...', () => {
  before(() => {
    cy.apiToken();
    cy.getCookie('_token')
      .should('exist')
      .then((token) => {
        _token = token.value;
      });
  });
  it('should return Feature Flags flags', () => {
    cy.visit(Cypress.env('host'));
    cy.request({
      method: 'GET',
      url: `${Cypress.env("host")}/api/feature-flags/flags`,
      headers: {
        Authorization: `bearer ${_token}`,
      }
    }).then((response) => {
      cy.log(response.body.data);
      expect(response.body.data);
    });
  });

  it('should return user Feature Flags user-flags', () => {
    cy.request({
      method: 'GET',
      url: `${Cypress.env("host")}/api/feature-flags/user-flags`,
      headers: {
        Authorization: `bearer ${_token}`,
      }
    }).then((response) => {
      cy.log(response.body.data);
      expect(response.body.data);
    });
  });

  it('should return user Feature Flags system-flags', () => {
    cy.request({
      method: 'GET',
      url: `${Cypress.env("host")}/api/feature-flags/system-flags`,
    }).then((response) => {
      cy.log(response.body.data);
      expect(response.body.data);
    });
  });

});

