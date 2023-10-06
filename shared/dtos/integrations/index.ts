export type IntegrationDto = {
  integrationId: string;
  description: string;
  name: string;
  installed: boolean;
  active: boolean;
  connectors?: ConnectorDto[];
}

export type ConnectorDto = {
  connectorId: number;
  name: string;
  accountConnectorId?: number;
  authenticated?: boolean;
  description?: string;
  status?: string;
  version?: string;
  iconUrl?: string;
  authType?: string;
  systemConnector?: boolean;
  parameters?: any;
  properties?: any;
};
