import { HttpStatus } from "@nestjs/common";
import { errorWithoutLogging, LOGGING_DISABLED_KEY, newHttpException } from "./utils";

describe(errorWithoutLogging, () => {

  it('should add the loggingDisabled flag', async () => {
    const error = errorWithoutLogging(new Error("uh oh!"));
    expect(error).toHaveProperty(LOGGING_DISABLED_KEY, true);
  });

  it('should return null or undefined when no error is provided', () => {
    let error = errorWithoutLogging(null);
    expect(error).toBeNull();

    error = errorWithoutLogging(undefined);
    expect(error).toBeUndefined();
  });
});

describe(newHttpException, () => {

  it(`should set the ${LOGGING_DISABLED_KEY} property if logging is disabled`, async () => {
    const exception = newHttpException(HttpStatus.NOT_FOUND, "this is a test", { log: false });
    expect(exception).toHaveProperty(LOGGING_DISABLED_KEY, true);
  });

  it('should enable logging by default', async () => {
    const exception = newHttpException(HttpStatus.NOT_FOUND, "this is a test");
    expect(exception).not.toHaveProperty(LOGGING_DISABLED_KEY);
  });
});