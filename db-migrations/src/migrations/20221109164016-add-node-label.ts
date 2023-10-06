import * as mongo from "mongodb";
import { withTransaction } from "../helpers/withTransaction";

export const up = async (db: mongo.Db, client: mongo.MongoClient) => {
  await withTransaction(client, async (session: mongo.ClientSession) => {
    // BlockSpaces node.
    await db.collection("lightningnodes").updateOne({tenantId: "9b847a50-9f4d-44da-8fdf-5da3ac61246a"}, {$set: {nodeLabel: "BlockSpaces, Inc."}})

    // Joe's node.
    await db.collection("lightningnodes").updateOne({tenantId: "a74aac90-52c0-4fd9-b06c-b46b46a552a1"}, {$set: {nodeLabel: "Satoshi Pacioli Accounting Services"}})

    // NWCL node.
    await db.collection("lightningnodes").updateOne({tenantId: "e11e74a6-c34f-4eb1-ab78-d33490f40a25"}, {$set: {nodeLabel: "NWAC Tampa, Inc"}})
  });
};

export const down = async (db: mongo.Db, client: mongo.MongoClient) => {
  await withTransaction(client, async (session: mongo.ClientSession) => {
    // BlockSpaces node.
    await db.collection("lightningnodes").updateOne({tenantId: "9b847a50-9f4d-44da-8fdf-5da3ac61246a"}, {$unset: {nodeLabel: 1}})

    // Joe's node.
    await db.collection("lightningnodes").updateOne({tenantId: "a74aac90-52c0-4fd9-b06c-b46b46a552a1"}, {$unset: {nodeLabel: 1}})

    // NWCL node.
    await db.collection("lightningnodes").updateOne({tenantId: "e11e74a6-c34f-4eb1-ab78-d33490f40a25"}, {$unset: {nodeLabel: 1}})
  });
};
