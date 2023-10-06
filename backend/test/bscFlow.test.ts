import {Flow, IFlow} from '../src/services/Flow';
import * as sampleBlockflowDefintion from './specs/sampleBlockflow.json';
let myFlow:Flow = new Flow();

describe("Flow class should construct", () => {
  //let result = myMapping.createMapping(source,destination);

  it("Should be defined", () => {
    expect(myFlow).toBeDefined();
  });
  it("Should be of class Flow", () => {
    expect(myFlow).toBeInstanceOf(Flow);
  });
});

describe("Flow class should load from an existing blockflow spec", () => {
  myFlow.createFromSpec(sampleBlockflowDefintion);
  it("Should be of class Flow", () => {
      expect(myFlow.id).toStrictEqual(sampleBlockflowDefintion.id);
  });

});

describe("Flow class should validate", () => {
  myFlow.createFromSpec(sampleBlockflowDefintion);
  it("Should be valid", () => {
    expect(myFlow.validate().isValid).toStrictEqual(true);
  });

});
describe("Flow class should execute", () => {
  myFlow.createFromSpec(sampleBlockflowDefintion);
  let initialData = {};
  it("Should be valid", () => {
    expect(myFlow.execute(initialData)).toStrictEqual({});
  });

});
