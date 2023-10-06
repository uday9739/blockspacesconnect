import {ConnectionFactory, InitialConnection, ResponseConnection, SystemConnection, SubflowConnection, TransformationConnection, IteratorConnection, IConnectionDefinition} from '../src/services/Connection';
import { IConnectorDefinition, IConnectorRoute, Connector} from '../src/services/Connector'
import * as netSuiteConnectorSpec from './specs/netSuiteConnectorSpec.json';
import * as initialConnectorSpec from './specs/initialConnectorSpec.json';
import * as responseConnectorSpec from './specs/responseConnectorSpec.json';
import * as bscTransformationArraySpec from './specs/tranformationArraySpec.json';
import * as bscIteratorSpec from './specs/iteratorSpec.json';
import * as bscSubflowSpec from './specs/subflowSpec.json';
import * as sampleBlockflowDefintion from './specs/sampleBlockflow.json';
import { IDestinationMapping, ISourceMapping, Mapping, MappingCollection } from '../src/services/Mapping';
import { Flow } from '../src/services/Flow';

let myFlow:Flow = new Flow();
myFlow.createFromSpec(sampleBlockflowDefintion);

let connection1=myFlow.steps[1][0];
let connection2=myFlow.steps[2][0];
let connection3=myFlow.steps[3][0];

let source:ISourceMapping = {
  connection: connection1,
  responseCode: "200",
  parameter: connection1.activeMethod.responses[0].parameters[0],
  type: "string"
};
let source2:ISourceMapping = {
  connection: connection1,
  responseCode: "200",
  parameter: connection1.activeMethod.responses[0].parameters[2],
  type: "string"
};
let destination:IDestinationMapping = {
  connection: connection2,
  parameter: connection2.activeMethod.parameters[0],
  type: "string"
}
let destination2:IDestinationMapping = {
  connection: connection3,
  parameter: connection3.activeMethod.parameters[0],
  type: "string"
};
let destination3:IDestinationMapping = {
  connection: connection3,
  parameter: connection3.activeMethod.parameters[2],
  type: "string"
};
let myMapping:Mapping = new Mapping(source,destination);
let myMapping2:Mapping = new Mapping(source,destination2);
let myMapping3:Mapping = new Mapping(source2,destination3);

describe("Initial Connection class tests", () => {
  let myConnection = ConnectionFactory.create(initialConnectorSpec);

  it("Initial Connection Class should be instantiated and of type InitialConnection from a Connector Spec", () => {
    expect(myConnection).toBeDefined();
    expect(myConnection).toBeInstanceOf(InitialConnection);
  });

  it("Initial Connection Class should be valid", () => {
    expect(myConnection.validate().isValid).toStrictEqual(true);
  });

});

describe("Initial Connection class tests from a Connection Spec in a blockflow",() => {

  let myConnection = ConnectionFactory.load(<IConnectionDefinition>sampleBlockflowDefintion.steps[0][0]);
  it("Initial Connection Class should be instantiated and of type InitialConnection from a Connection Spec", () => {
    expect(myConnection).toBeDefined();
    expect(myConnection).toBeInstanceOf(InitialConnection);
  });

  it("Initial Connection Class should be valid", () => {
    expect(myConnection.validate().isValid).toStrictEqual(true);
  });
})

describe("Response Connection class tests from a Connector Spec", () => {
  let myConnection = ConnectionFactory.create(responseConnectorSpec);
  it("Response Connection Class should be instantiated and of type ResponseConnection from a Connector Spec", () => {
    expect(myConnection).toBeDefined();
    expect(myConnection).toBeInstanceOf(ResponseConnection);
  });

  it("Response Connection Class should be valid", () => {
    expect(myConnection.validate().isValid).toStrictEqual(true);
  });

});

describe("Response Connection class tests from a Connection Spec in a Blockflow Step", () => {
  let myConnection = ConnectionFactory.load(<IConnectionDefinition>sampleBlockflowDefintion.steps[4][0]);
  it("Response Connection Class should be instantiated and of type ResponseConnection from a Connection Spec", () => {
    expect(myConnection).toBeDefined();
    expect(myConnection).toBeInstanceOf(ResponseConnection);
  });

  it("Response Connection Class should be valid", () => {
    expect(myConnection.validate().isValid).toStrictEqual(true);
  });

});

describe("System Connection class tests with Connector Spec", () => {
  
  let myConnection = ConnectionFactory.create(netSuiteConnectorSpec);
  let myConnector = new Connector(netSuiteConnectorSpec);
  it("System Connection Class should be instantiated and of type SystemConnection from a Connector Spec", () => {
    expect(myConnection).toBeDefined();
    expect(myConnection).toBeInstanceOf(SystemConnection);
  });

  it("System Connection Class should be valid", () => {
    expect(myConnection.validate().isValid).toStrictEqual(true);
  });
  it("System Connection should select the active method", () => {  
    let myMappings = new MappingCollection();
    myMappings.addMapping(myMapping);
    myMappings.addMapping(myMapping2);
    myMappings.addMapping(myMapping3)

    let mySystemConnection = <SystemConnection>connection1;
    let selectedRoute:IConnectorRoute = myConnector.getRoutes()[0]
    let expectedActiveMethod:IConnectorRoute = myConnector.getRoutes()[0];
    expect(myMappings.length).toStrictEqual(3);
    expect(mySystemConnection.setActiveMethod(selectedRoute,myMappings)).toStrictEqual(expectedActiveMethod);
    expect(myMappings.length).toStrictEqual(0);
  });

  it("System Connection should provide a set of servers that can be selected", () => {
    let mySystemConnection = <SystemConnection>myConnection;
    mySystemConnection.setSelectedServer(myConnector.servers[0]);
    expect(mySystemConnection.servers[0]).toStrictEqual(myConnector.servers[0])
  });

});

describe("System Connection class tests with Connection Spec", () => {
  
  let myConnection = ConnectionFactory.load(<IConnectionDefinition>sampleBlockflowDefintion.steps[1][0]);
  let myConnector = new Connector(netSuiteConnectorSpec);

  it("System Connection Class should be instantiated and of type SystemConnection from a Connection Spec", () => {
    expect(myConnection).toBeDefined();
    expect(myConnection).toBeInstanceOf(SystemConnection);
  });

  it("System Connection Class should be valid", () => {
    expect(myConnection.validate().isValid).toStrictEqual(true);
  });

  it("System Connection should select the active method", () => {
    let myMappings = new MappingCollection();
    myMappings.addMapping(myMapping);
    myMappings.addMapping(myMapping2);
    myMappings.addMapping(myMapping3)

    let mySystemConnection = <SystemConnection>connection1;
    let selectedRoute:IConnectorRoute = myConnector.getRoutes()[0]
    let expectedActiveMethod:IConnectorRoute = myConnector.getRoutes()[0];
    expect(myMappings.length).toStrictEqual(3);
    expect(mySystemConnection.setActiveMethod(selectedRoute,myMappings)).toStrictEqual(expectedActiveMethod);
    expect(myMappings.length).toStrictEqual(0);
  });

  it("System Connection should provide a set of servers that can be selected", () => {
    let mySystemConnection = <SystemConnection>myConnection;
    mySystemConnection.setSelectedServer(myConnector.servers[0]);
    expect(mySystemConnection.servers[0]).toStrictEqual(myConnector.servers[0])
  });

});

describe("Transformation Connection class tests", () => {
  let myConnection = ConnectionFactory.create(bscTransformationArraySpec);
  it("Transformation Connection Class should be instantiated and of type TransfomrationConnection", () => {
    expect(myConnection).toBeDefined();
    expect(myConnection).toBeInstanceOf(TransformationConnection);
  });
  it("Transformation Connection Class should be valid", () => {
    expect(myConnection.validate().isValid).toStrictEqual(true);
  });

});

describe("Subflow Connection class tests", () => {
  let myConnection = ConnectionFactory.create(bscSubflowSpec);
  it("Subflow Connection Class should be instantiated and of type IteratorConnection", () => {
    expect(myConnection).toBeDefined();
    expect(myConnection).toBeInstanceOf(SubflowConnection);
  });
  it("Subflow Connection Class should be valid", () => {
    expect(myConnection.validate().isValid).toStrictEqual(true);
  });

});

describe("Iterator Connection class tests", () => {
  let myConnection = ConnectionFactory.create(bscIteratorSpec);
  it("Iterator Connection Class should be instantiated and of type IteratorConnection", () => {
    expect(myConnection).toBeDefined();
    expect(myConnection).toBeInstanceOf(IteratorConnection);
  });
  it("Iterator Connection Class should be valid", () => {
    expect(myConnection.validate().isValid).toStrictEqual(true);
  });

});