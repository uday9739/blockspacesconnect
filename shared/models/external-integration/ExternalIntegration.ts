
export interface ExternalIntegration {

  // ExternalIntegration Id - should be a human readable integration id (i.e. BIP_QBO)
  id: string,

  // ExternalIntegration Name - The name that will be displayed in the UI for the Web2 Integration
  name: string,

  // Description - an optional description of the ExternalIntegration
  description?: string,

  // Templates - a list of Cyclr Template Id's
  templates?: string[],

}

