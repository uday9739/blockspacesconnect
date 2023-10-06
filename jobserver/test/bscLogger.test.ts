import {env} from "../src/env"
import {logger, transactionLogger} from "@blockspaces/shared/loggers/bscLogger"
import * as path from 'path';
const thisModule = path.basename(__filename);
import {describe, test, expect} from "@jest/globals";

describe('Logger', () => {
  test('The Logger should construct and run', (done) => {
    logger.level = "debug";
    logger.debug();
    logger.debug(`My message from ${env.app.name} ${env.node}`);
    logger.debug({module: thisModule});
    logger.debug(`My message from ${env.app.name} ${env.node}`,{pid: env.pid});
    logger.debug(`My message from ${env.app.name} ${env.node}`, {module: thisModule});
    logger.debug(`My message from ${env.app.name} ${env.node}`, {module: thisModule}, {source: "the source"});
    logger.debug(`My message from ${env.app.name} ${env.node}`, {module: thisModule}, {source: "the source"}, {response: "the response"});
    expect(1).toEqual(1);
    done();
  });

  test('The transactionLogger should construct and run', (done) => {
    transactionLogger.level = "info";
    transactionLogger.info();
    transactionLogger.info(`My message from ${env.app.name} ${env.node}`);
    transactionLogger.info({module: thisModule});
    transactionLogger.info(`My message from ${env.app.name} ${env.node}`,{pid: env.pid});
    transactionLogger.info(`My message from ${env.app.name} ${env.node}`, {module: thisModule});
    transactionLogger.info(`My message from ${env.app.name} ${env.node}`, {module: thisModule}, {source: "the source"});
    transactionLogger.info(`My message from ${env.app.name} ${env.node}`, {module: thisModule}, {source: "the source"}, {response: "the response"});
    expect(1).toEqual(1);
    done();
  });

});


