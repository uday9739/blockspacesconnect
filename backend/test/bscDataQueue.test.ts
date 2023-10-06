import { DataQueue } from '../src/services/DataQueue';
import { Credential, ICredentialReference, IToken } from '../src/services/Credential';
import { IConnectorDefinition, EType } from '../src/services/Connector';
import { ConnectionFactory, SystemConnection } from '../src/services/Connection';
import { EEnvironmentTypes } from '../src/services/Server';

let myDataQueue = new DataQueue();

describe("DataQueue class should construct", () => {

  it("Should Return a Credential class", () => {
    expect(myDataQueue).toBeDefined();
    expect(myDataQueue).toBeInstanceOf(DataQueue);
  });

  it("Should be able to add a new item to the DataQueue", () => {
    let myKey = "initialData";
    let myValue = { test: "test value", test2: 1234, test3: true }
    myDataQueue.addItem(myKey, myValue);
    expect(myDataQueue.getItem(myKey)).toStrictEqual(myValue);
  });
});