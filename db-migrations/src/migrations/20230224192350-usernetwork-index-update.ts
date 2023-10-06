import * as mongo from "mongodb";
import { withTransaction } from "../helpers/withTransaction";

export const up = async (db: mongo.Db, client: mongo.MongoClient) => {
  await withTransaction(client, async (session: mongo.ClientSession) => {
    const importCollectionExists = await db.listCollections({ name: "usernetworks" }).hasNext();
    if (!importCollectionExists) {
      // do nothing if UserContactInfoImports collection doesn't exist
      return;
    }
    const usernetworks = db.collection("usernetworks");

    if (await usernetworks.indexExists("userId_1_networkId_1")) {
      await usernetworks.dropIndex("userId_1_networkId_1");
    }
  });
};

export const down = async (db: mongo.Db, client: mongo.MongoClient) => {
  await withTransaction(client, async (session: mongo.ClientSession) => {
    // Migration down code here.
  });
};
