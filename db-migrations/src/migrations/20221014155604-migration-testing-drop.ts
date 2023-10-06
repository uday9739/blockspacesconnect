import * as mongo from "mongodb";
import { withTransaction } from "../helpers/withTransaction";

/**
 * Drop the "migrationTesting" collection that was created by the initial test migrations
 */
export const up = async (db: mongo.Db, client: mongo.MongoClient) => {
  await db.dropCollection("migrationTesting");
};

export const down = async (db: mongo.Db, client: mongo.MongoClient) => {
  await withTransaction(client, async (session: mongo.ClientSession) => {
    db.createCollection("migrationTesting");
  });
};
