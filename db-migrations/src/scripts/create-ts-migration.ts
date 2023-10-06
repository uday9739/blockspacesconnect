import { copyFile } from "fs";
import * as path from "path";

const migrateMongo = require('migrate-mongo');
const migrateMongoConfig = require('../../migrate-mongo-config');
const args = process.argv.slice(2);
const migrationName = args[0];

migrateMongo.config.set(migrateMongoConfig);
migrateMongo
  .create(migrationName)
  .then((fileName: string) => {
    const src = "./src/templates/migrationTemplate.ts";
    const dest = `${migrateMongoConfig.migrationsDir}/${fileName}`;
    copyFile(src, dest, (error) => {
      if (error) {
        console.error(`Error Updating Migration File: ${error.message}`);
        return;
      }
      console.log(`Created: ${path.resolve(migrateMongoConfig.migrationsDir)}/${fileName}`);
    });
  })
  .catch((err: { message: any; }) => {
    console.error(`Error Creating Migration File: ${err.message}`);
  });


