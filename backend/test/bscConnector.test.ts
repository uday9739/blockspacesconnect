import {EType, ESubType, IConnectorDefinition, Connector, IConnectorRoutes} from '../src/services/Connector'
import * as netSuiteConnectorSpec from './specs/netSuiteConnectorSpec.json';
import * as initialConnectorSpec from './specs/initialConnectorSpec.json';
import * as responseConnectorSpec from './specs/responseConnectorSpec.json';
import * as bscTransformationArraySpec from './specs/tranformationArraySpec.json';
import * as bscIteratorSpec from './specs/iteratorSpec.json';
import * as bscSubflowSpec from './specs/subflowSpec.json';
import * as sampleBlockflowDefintion from './specs/sampleBlockflow.json';

describe("Initial Connection class tests", () => {
  let myConnector = new Connector(<IConnectorDefinition>netSuiteConnectorSpec);

  it("Initial Connection Class should be instantiated and of type InitialConnection from a Connector Spec", () => {
    expect(myConnector).toBeDefined();
    expect(myConnector).toBeInstanceOf(Connector);
  });

  it("Initial Connection Class should be valid", () => {
    expect(myConnector.getRoutes()).toHaveLength(14);
  });

});

