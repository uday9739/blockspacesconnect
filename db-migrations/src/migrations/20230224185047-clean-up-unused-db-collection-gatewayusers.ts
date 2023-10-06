import * as mongo from "mongodb";
import { withTransaction } from "../helpers/withTransaction";

export const up = async (db: mongo.Db, client: mongo.MongoClient) => {
  await withTransaction(client, async (session: mongo.ClientSession) => {
    const importCollectionExists = await db.listCollections({ name: "gatewayusers" }).hasNext();
    if (!importCollectionExists) {
      // do nothing if UserContactInfoImports collection doesn't exist
      return;
    }
    await db.dropCollection("gatewayusers");

  });
};

export const down = async (db: mongo.Db, client: mongo.MongoClient) => {
  await withTransaction(client, async (session: mongo.ClientSession) => {
    // Migration down code here.
  });
};
