import { uniqueId } from "lodash";
import { Connection, ConnectionType } from "../../../models/flows/Connection";
import { Flow, FlowType } from "../../../models/flows/Flow";


let flow: Flow;

beforeEach(() => {
  flow = new Flow({
    name: "Test Flow",
    clientId: "abc123",
    id: uniqueId(),
    isAuthFlow: false,
    mappings: [],
    steps: [[]],
    type: FlowType.ONEWAY
  });
})

describe(Flow.prototype.getConnectionById, () => {

  it("should return the id of a matching connection", () => {
    const connectionId = uniqueId();
    const connection: Connection = new Connection({
      id: connectionId,
      connectorId: "1",
      description: "",
      type: ConnectionType.SYSTEM
    });

    flow.steps[0].push(connection);

    const foundConnection = flow.getConnectionById(connection.id);
    expect(foundConnection).toBe(connection);
  })
})