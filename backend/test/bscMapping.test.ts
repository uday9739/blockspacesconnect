import { Flow } from "../src/services/Flow";
import { Mapping, ISourceMapping, IDestinationMapping, MappingCollection, OrderedMappings } from "../src/services/Mapping";
import * as sampleBlockflowDefintion from './specs/sampleBlockflow.json';
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

describe("Mapping class should construct off of Source/Destination Objects", () => {
  let myMapping:Mapping = new Mapping(source,destination);

  it("Should Return source and destination", () => {
    expect(myMapping).toBeDefined();
  });
  
  it("class should construct", () => {
    expect(myMapping.constructor).toBeTruthy();
  });

  it("class should create a mapping object from a source/destination", () => {
      expect(myMapping).toBeInstanceOf(Mapping);
  });

  it("Class should return source and destination", () => {
    expect(myMapping.source).toStrictEqual(source);
    expect(myMapping.destination).toStrictEqual(destination);
  });

  it("Class should return a string representation of the source and destination", () => {
    expect(myMapping.getSourceString()).toStrictEqual(`${source.connection.id}:${source.connection.activeMethod.method}:${source.connection.activeMethod.name}:${source.responseCode}:${source.parameter.name}:${source.type}`);
    expect(myMapping.getDestinationString()).toStrictEqual(`${destination.connection.id}:${destination.connection.activeMethod.method}:${destination.connection.activeMethod.name}:${destination.parameter.name}:${destination.type}`);
  })
});

// describe("Mapping class should construct off of Source/Destination Strings", () => {
//     let myMapping = new Mapping();

//     let result = myMapping.createMappingFromStrings(sourceString,destinationString);
  
//     it("Should Return source and destination", () => {
//       expect(myMapping).toBeDefined();
//     });
    
//     it("class should construct", () => {
//       expect(myMapping.constructor).toBeTruthy();
//     });
  
//     it("class should create a mapping object from a source/destination", () => {
//         expect(result).toBe(void 0);
//     });
  
//     it("Class should return source and destination", () => {
//       expect(myMapping.getSource()).toStrictEqual(source);
//       expect(myMapping.getDestination()).toStrictEqual(destination);
//     });

//     it("Class should return a string representation of the source and destination", () => {
//       expect(myMapping.getSourceString()).toStrictEqual(sourceString);
//       expect(myMapping.getDestinationString()).toStrictEqual(destinationString);
//     })
      
// });

describe("MappingCollection class should construct", () => {
  const myMappingCollection = new MappingCollection();
  let myMapping:Mapping = new Mapping(source,destination);
  let myMapping2:Mapping = new Mapping(source,destination2);
  let myMapping3:Mapping = new Mapping(source2,destination3);

  it("MappingCollection should be defined", () => {
    expect(myMappingCollection).toBeDefined();
  });
  
  it("MappingCollection should return a null nested array", () => {
    expect(myMappingCollection.length).toStrictEqual(0);
  });

  it("MappingCollection add a mapping", () => {
    myMappingCollection.addMapping(myMapping);
    expect(myMappingCollection.length).toStrictEqual(1);
    expect(myMappingCollection.getMappingsForConnection(destination.connection.id).length).toStrictEqual(1);
    expect(myMappingCollection.getMappingsForConnection(destination2.connection.id).length).toStrictEqual(0);
    expect(myMappingCollection.getMappingsForConnection(destination3.connection.id).length).toStrictEqual(0);
  });

  it("MappingCollection should have three mappings now", () => {
    myMappingCollection.addMapping(myMapping2);
    myMappingCollection.addMapping(myMapping3);
    let myMappings:MappingCollection = myMappingCollection;
    expect(myMappings.length).toStrictEqual(3);
    expect(myMappingCollection.getMappingsForConnection(destination2.connection.id).length).toStrictEqual(2);
  });

  it("MappingCollection should return ordered list of connectionId's based on dependencies", () => {
    let myOrderedMappings:OrderedMappings = myMappingCollection.getExecutionOrder();
    expect(myOrderedMappings).toStrictEqual([[source.connection.id],[destination2.connection.id,destination.connection.id]])
  });

  it("MappingCollection delete a mapping should remove the mapping from the collection", () => {
    myMappingCollection.removeMapping(myMapping2);

    expect(myMappingCollection.length).toStrictEqual(2);
    let myOrderedMappings:OrderedMappings = myMappingCollection.getExecutionOrder();
    expect(myOrderedMappings).toStrictEqual([[source.connection.id],[destination3.connection.id,destination.connection.id]])
  });

  it("MappingCollection delete a mapping by connectionId should remove the mappings from the collection", () => {
    myMappingCollection.addMapping(myMapping2);
    myMappingCollection.removeMappingsByConnectionId(source.connection.id);

    expect(myMappingCollection.length).toStrictEqual(0);
    let myOrderedMappings:OrderedMappings = myMappingCollection.getExecutionOrder();
    expect(myOrderedMappings).toStrictEqual([])
  });

});
