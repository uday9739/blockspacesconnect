// Objective:
//  Test the ui-backend integration by making direct API calls
// Contributors:
//  Jeremy Ramos
// Notes:
//  This test should be used for integration testing during staging or production deployment.
//  Test transactions may need to be purged from the database.

import { bscTransaction} from "../src/helpers/bscTransaction";
import { moduleReport } from "../src/helpers/moduleReporter"

describe("bscTransaction class should construct", () => {

  it("a test should run", () => {
    expect(1).toBe(1);
  });

  const myTransaction = new bscTransaction("other","test");
  it("class should construct", () => {
    expect(myTransaction.constructor).toBeTruthy();
  });

  it("the transaction status should be started", () => {
    expect(myTransaction.getTransactionStatus()).toBe("started");
    myTransaction.setTransactionStatus("running");
    expect(myTransaction.getTransactionStatus()).toBe("running");
    myTransaction.setTransactionStatus("completed");
    expect(myTransaction.getTransactionStatus()).toBe("completed");
  });

});
