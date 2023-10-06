import {env} from "../src/env"
import jest, {expect, describe, test} from "@jest/globals";

describe('env', () => {
  test('The env should provide environement variables', (done) => {
    expect(env.app.name).toEqual("blockspaces-platform");
    expect(env.backend.backendGrpcUrl).toBeDefined();
    expect(env.backend.backendGrpcUrl).toBeDefined();
    done();
  });

});
