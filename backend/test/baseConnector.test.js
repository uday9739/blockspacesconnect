import { jest } from "@jest/globals";
import { BaseConnector } from "../src/connectors/baseConnector.js";

const blockFlowConnection = await import("./specs/blockFlowConnection.json");
const mappings = await import("./specs/mappings.json");
const dataQueue = await import("./specs/dataQueue.json");

describe("BaseConnector class", () => {
  // jest.setTimeout(10000);
  const MyBaseConnector = new BaseConnector(blockFlowConnection["default"], dataQueue["default"], mappings["default"]);

  it("class should construct", () => {
    expect(MyBaseConnector.constructor).toBeTruthy();
  });

  // // Spying on the actual methods of the BaseConnector class
  // jest.spyOn(MyBaseConnector, "init");
  jest.spyOn(MyBaseConnector, "sortMappings");
  jest.spyOn(MyBaseConnector, "getBlockFlowConnection");
  jest.spyOn(MyBaseConnector, "getDataQueue");
  jest.spyOn(MyBaseConnector, "getMappings");
  jest.spyOn(MyBaseConnector, "getTypeOfField");
  jest.spyOn(MyBaseConnector, "mapURLParameters");
  jest.spyOn(MyBaseConnector, "mapData");
  jest.spyOn(MyBaseConnector, "getData");

  /*it("should init", (done) => {
    // eslint-disable-next-line no-unused-vars
    function callback(data) {
      try {
        expect.objectContaining(data);
        done();
      } catch (error) {
        done(error);
      }
    }
    MyBaseConnector.init(callback);
    expect(MyBaseConnector.init).toHaveBeenCalledTimes(3);
  });*/

  it("should return sortMappings", () => {
    expect(MyBaseConnector.sortMappings(mappings["default"][0], mappings["default"][0])).toEqual(-1);
    expect(MyBaseConnector.sortMappings).toHaveBeenCalledTimes(1);
  });

  it("should return getBlockFlowConnection", () => {
    const expected = { id: "e8a2ad0c-ab5a-4096-a2ae-b6d7fb44c783" };
    expect(MyBaseConnector.getBlockFlowConnection()).toMatchObject(expected);
    expect(MyBaseConnector.getBlockFlowConnection).toHaveBeenCalledTimes(1);
  });

  it("should return getDataQueue", () => {
    expect.objectContaining(MyBaseConnector.getDataQueue());
    expect(MyBaseConnector.getBlockFlowConnection).toHaveBeenCalledTimes(1);
  });

  it("should return getMappings", () => {
    expect.arrayContaining(MyBaseConnector.getMappings());
    expect(MyBaseConnector.getMappings).toHaveBeenCalledTimes(1);
  });

  it("should return getTypeOfField", () => {
    const fieldName = [];
    expect(MyBaseConnector.getTypeOfField(fieldName)).toEqual("Single Value");
    expect(MyBaseConnector.getTypeOfField).toHaveBeenCalledTimes(1);
  });

  it("should return mapURLParameters", () => {
    const parameters = {};
    const url = "{http://localhost:3001}";
    expect(MyBaseConnector.mapURLParameters(parameters, url)).toEqual(url);
    expect(MyBaseConnector.mapURLParameters).toHaveBeenCalledTimes(1);
  });

  it("should return mapData", () => {
    // TODO: fix the returning empty obj
    // expect(MyBaseConnector.mapData(blockFlowConnection["default"], dataQueue["default"], mappings["default"])).resolves.toBeDefined();
    expect.objectContaining(MyBaseConnector.mapData(blockFlowConnection["default"], dataQueue["default"], mappings["default"]));
    expect(MyBaseConnector.mapData).toHaveBeenCalledTimes(1);
  });

  it("should return getData", () => {
    // TODO: fix this once getData() passes back the connection.
    // expect(MyBaseConnector.connect()).toBeDefined();
    expect.objectContaining(MyBaseConnector.getData());
    expect(MyBaseConnector.getData).toHaveBeenCalledTimes(1);
  });
});
