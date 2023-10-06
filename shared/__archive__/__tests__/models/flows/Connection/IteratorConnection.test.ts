import uniqueId from "lodash/uniqueId";
import { ConnectionType, IteratorConnection } from "../../../../models/flows/Connection";
import { ParameterType, TParameter } from "../../../../models/flows/Parameter";

let connection: IteratorConnection

beforeEach(() => {
  connection = new IteratorConnection({
    type: ConnectionType.ITERATOR,
    connectorId: "someConnector",
    id: "abc123",
    flowId: "someFlow",
    description: "",
    activeMethod: {
      name: "iterator",
      contentType: "application/json",
      method: "GET",
      parameters: [],
      responses: []
    }
  })
})

describe("arrayType", () => {

  const buildParameter = (type: ParameterType): TParameter => {
    return {
      type: type,
      address: { connectionId: uniqueId(), endpoint: "", method: "GET" },
      asJson: "",
      getPathString: () => "",
      arrayType: undefined
    }
  }

  it("should match param item type if param is an array", () => {
    const itemType = ParameterType.STRING;
    const param = buildParameter(ParameterType.ARRAY);
    param.items = { item: buildParameter(itemType) };

    connection.activeMethod.parameters = [param];
    expect(connection.arrayType).toBe(itemType);
  })

  it("should be null when no active method is defined", () => {
    connection.activeMethod = null;
    expect(connection.arrayType).toBeNull();
  })

  it("should be null when no params are available", () => {
    connection.activeMethod.parameters = [];

    expect(connection.arrayType).toBeNull();
  })

  it("should be null when param is not an array", () => {
    const paramTypes = Object.values(ParameterType).filter(t => t !== ParameterType.ARRAY);

    paramTypes.forEach(type => {
      connection.activeMethod.parameters = [buildParameter(type)];
      expect(connection.arrayType).toBeNull();
    })
  })
})