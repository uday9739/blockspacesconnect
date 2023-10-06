import * as mongo from "mongodb";
import { withTransaction } from "../helpers/withTransaction";

export const up = async (db: mongo.Db, client: mongo.MongoClient) => {
  await withTransaction(client, async (session: mongo.ClientSession) => {
    const erpobjects = db.collection("erpobjects");

    if (await erpobjects.indexExists("metadata.externalId_1")) {
      await erpobjects.dropIndex("metadata.externalId_1");
    }

  });
};

