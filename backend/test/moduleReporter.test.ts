import { moduleReport } from "../src/helpers/moduleReporter";
import { logger, Logger } from "@blockspaces/shared/loggers/bscLogger";



describe("moduleReport should generate a valid report", () => {

  it("reporter should generate a report", () => {
    let report = moduleReport();
    expect(report).toBeTruthy();
    expect(report.filepath).toBe(__filename);
  });

  it("logger should log", () => {
    let report = moduleReport();
    expect(logger.info("Test message",{ module: report })).toBeUndefined();
  });

  it("logger should log", () => {
    let report = moduleReport(new Error(),3);
    expect(logger.info("Test message",{ module: report })).toBeUndefined();
  });

});
