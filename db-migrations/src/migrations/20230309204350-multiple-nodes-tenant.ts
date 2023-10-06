import * as mongo from "mongodb";
import { withTransaction } from "../helpers/withTransaction";

export const up = async (db: mongo.Db, client: mongo.MongoClient) => {
  await withTransaction(client, async (session: mongo.ClientSession) => {
    // Migration up code here.
    const nodes = db.collection("lightningnodes")
    if (await nodes.indexExists("tenantId_1")) {
      await nodes.dropIndex("tenantId_1")
    }
  });
};

export const down = async (db: mongo.Db, client: mongo.MongoClient) => {
  // await withTransaction(client, async (session: mongo.ClientSession) => {
    const nodes = db.collection("lightningnodes")

    nodes.createIndex({id:1}, {
      name: "tenantId_1",
      unique: true,
      sparse: true
    })
  // });
};
