import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(process.cwd(), `.env${process.env.NODE_ENV === "test" ? ".test" : ""}`) });

export = {
  mongodb: {
    url: process.env.MIGRATION_CONNECT_STRING as string,
    databaseName: "connect",
    options: {
      //   connectTimeoutMS: 3600000, // increase connection timeout to 1 hour
      //   socketTimeoutMS: 3600000, // increase socket timeout to 1 hour
    }
  },
  migrationsDir: "./src/migrations",
  changelogCollectionName: "migrationlog",
  migrationFileExtension: ".ts",
  useFileHash: false,
  moduleSystem: 'esm',
};