/*
 * This script runs "up" migrations using migrate-mongo,
 * and adds support for custom command line arguments, which are especially useful for
 * providing configuration values when running migrations within the CI/CD pipeline.
 *
 */

import migrateMongoConfig from "../../migrate-mongo-config";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import * as migrateMongo from "migrate-mongo";

const config = { ...migrateMongoConfig };
const options = getCommandLineOptions();

if (options.mongodbUrl) {
  config.mongodb.url = options.mongodbUrl;
}

run();

async function run() {
  migrateMongo.config.set(config);

  const { db, client } = await migrateMongo.database.connect();
  const migrations = await migrateMongo.up(db, client);

  for (const migration of migrations) {
    console.log("MIGRATED UP:", migration);
  }

  process.exit(0);
}


function getCommandLineOptions(): CommandLineOptions {
  const options = yargs(hideBin(process.argv))
    .options({
      "mongodbUrl": {
        type: "string",
        requiresArg: true
      }
    })
    .parseSync();

  return options;
}

interface CommandLineOptions {
  /** MongoDB connection string URL */
  mongodbUrl?: string
}