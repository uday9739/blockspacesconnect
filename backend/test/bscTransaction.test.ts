//import jest from "@jest/globals";
import { bscTransaction, TRANSACTION_STATUS, TRANSACTION_TYPE } from "../src/helpers/bscTransaction";
import { moduleReport } from "../src/helpers/moduleReporter"
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("bscTransaction class should construct", () => {

  it("a test should run", () => {
    expect(1).toBe(1);
  });

  let testResponse =  {status: 200,data: "test succeeded"};
  mockedAxios.request.mockResolvedValue(testResponse);

  const myTransaction = new bscTransaction("other","test");
  it("class should construct", () => {
    expect(myTransaction.constructor).toBeTruthy();
  });

  it("should return the uuid based transactionId", () => {
    expect(myTransaction.getTransactionId()).toEqual(expect.stringMatching(/^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i));
  });

  it("should return the timestamp based transactionId", () => {
    expect.stringMatching(/.*\/\d{10}\..*!/i);
  });

  const mySecondTransaction = new bscTransaction("other","test");
  it("class should construct with parameters", () => {
    expect(mySecondTransaction.constructor).toBeTruthy();
  });

  it("the new transaction status should be started", () => {
    expect(mySecondTransaction.getTransactionStatus()).toBe("started");
    mySecondTransaction.setTransactionStatus("completed");
    expect(mySecondTransaction.getTransactionStatus()).toBe("completed");
  });

});
