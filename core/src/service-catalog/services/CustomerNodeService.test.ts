import { createMock } from "ts-auto-mock";
import { PostgresQueryRunner } from "../../platform/postgres"
import { CustomerNodeService, GetCustomerNodes } from "../index";
import { ResultsJSON } from "../../node-monitoring-db/services/NodeMonitoringPoktData.test.json";
import { QueryResult } from "pg";

describe(CustomerNodeService, () => {
    let customerNodeService: CustomerNodeService;
    let mocks: {
        postgresQueryRunner: PostgresQueryRunner
    }
    beforeEach(() => {
        mocks = {
            postgresQueryRunner: createMock<PostgresQueryRunner>()
        }
        customerNodeService = new CustomerNodeService(mocks.postgresQueryRunner);
    });

    /** getCustomerNodes */
    it(`${CustomerNodeService.name} getCustomerNodes`, async () => {
        const results: QueryResult<GetCustomerNodes[]> = {
            rows: [ResultsJSON.GetCustomerNodes],
            command: "",
            rowCount: 0,
            oid: 0,
            fields: []
          };
        mocks.postgresQueryRunner.query = jest.fn().mockResolvedValue(results);
        const test = await customerNodeService.getCustomerNodes(21);
        expect(test).toBeDefined();
        expect(test[0][0].ACCOUNTID).toBe(21);
        expect(test[0][0].NODEID).toBe("BS-06");
        expect(test[0][0].NODETYPE).toBe("POKT-NODE");
        expect(test[0][0].NODEKEY).toBe("0c364376cb8f1a83755e3684b4144b72d1dcefa9");
        expect(test[0][0].SERVICE_URL).toBe("bs-pokt-06.n.blockspaces.io");


        expect(test[0][162].ACCOUNTID).toBe(21);
        expect(test[0][162].NODEID).toBe("21-pokt-158");
        expect(test[0][162].NODETYPE).toBe("POKT-NODE");
        expect(test[0][162].NODEKEY).toBe("625ac99a1e4fc76c36f2208698d17f82a3bf1ba7");
        expect(test[0][162].SERVICE_URL).toBe("21-pokt-158.blockspaces.us");

    });
});


