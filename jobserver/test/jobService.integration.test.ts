import {jest, expect, describe, it, beforeAll} from "@jest/globals";
import {logger} from "@blockspaces/shared/loggers/bscLogger";
import JobService from "../src/Job.service";

//Make the console quite for testing
logger.info = jest.fn();
logger.debug = jest.fn();
logger.error = jest.fn();
logger.trace = jest.fn();
logger.log = jest.fn();

let myJobService: JobService;

describe("The JobService service should respond to", () => {
  it("the JobService should implement newFlowJob()", async () => {
    myJobService = await JobService.newJobService();
     const response = await myJobService.newFlowJob("blockFlowID",{data: "my initial data"},{interval: "* * * * *"});
     expect(response.status).toBe("success");
     expect(response.data).toBeDefined();
  });
});
