import { IParameterAddress } from './Parameter'

export interface IMapping {
  source: IParameterAddress;
  destination: IParameterAddress,
}

export class Mapping implements IMapping {
  source: IParameterAddress;
  destination: IParameterAddress;

  constructor(source: IParameterAddress, destination:IParameterAddress) {
    this.source = source;
    this.destination = destination;
  }

  getSourceString(): string {
    const { source } = this;
    return `${source.connectionId}:${source.method}:${source.endpoint}:${source.responseCode}:${source.path}`;
  }

  getDestinationString(): string {
    const { destination } = this;
    return `${destination.connectionId}:${destination.method}:${destination.endpoint}:${destination.path}`;
  }
}
