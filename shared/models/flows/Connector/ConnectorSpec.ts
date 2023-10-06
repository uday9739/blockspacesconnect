import { TParameter } from "../Parameter";

export type ConnectorSpec = Array<IConnectorPathSpec>;

export interface IConnectorPathSpec {
  name: string;
  methods: IConnectorMethodSpec[]
}

export interface IConnectorMethodSpec {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
  description?: string;
  contentType: string;
  security: any[];
  parameters: TParameter[];
  responses: IConnectorResponseSpec[];
}

export interface IConnectorResponseSpec {
  responseCode: string;
  description: string;
  parameters: TParameter[];
}
