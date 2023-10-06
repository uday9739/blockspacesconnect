import * as mongo from "mongodb";
import { withTransaction } from "../helpers/withTransaction";

export const up = async (db: mongo.Db, client: mongo.MongoClient) => {
  await withTransaction(client, async (session: mongo.ClientSession) => {
    // Add the gossip port to all production claimed Lightning nodes.
    // https://lnc-27440.ln.blockspaces.com
    await db.collection("lightningnodes").updateOne({tenantId: "9b847a50-9f4d-44da-8fdf-5da3ac61246a"}, {$set: {gossipEndpoint: "159.89.224.61:9735"}})
    // https://lnc-25968.ln.blockspaces.com
    await db.collection("lightningnodes").updateOne({tenantId: "a74aac90-52c0-4fd9-b06c-b46b46a552a1"}, {$set: {gossipEndpoint: "159.89.224.28:9735"}})
    // https://lnc-21241.ln.blockspaces.com
    await db.collection("lightningnodes").updateOne({tenantId: "e11e74a6-c34f-4eb1-ab78-d33490f40a25"}, {$set: {gossipEndpoint: "104.248.57.74:9735"}})
    // https://nyc-ln-11.ln.blockspaces.com
    await db.collection("lightningnodes").updateOne({tenantId: "c632c119-d40b-4274-bdbf-03884e047b14"}, {$set: {gossipEndpoint: "146.190.69.212:9735"}})

    // Add the gossip port to the production unclaimed Lightning node pool.
    // https://nyc-ln-14.ln.blockspaces.com
    await db.collection("lightningnodes").updateOne({nodeId: "0020ea54-fd3b-4696-ba10-4120d605616f"}, {$set: {gossipEndpoint: "178.128.145.234:9735"}})
    // https://nyc-ln-12.ln.blockspaces.com
    await db.collection("lightningnodes").updateOne({nodeId: "bd3b846b-1f56-4062-aecb-b2e8861847cb"}, {$set: {gossipEndpoint: "178.128.145.97:9735"}})
    // https://nyc-ln-13.ln.blockspaces.com
    await db.collection("lightningnodes").updateOne({nodeId: "09f75592-9a61-4c25-a9e9-5720d73280cf"}, {$set: {gossipEndpoint: "178.128.153.133:9735"}})
    // https://nyc-ln-10.ln.blockspaces.com
    await db.collection("lightningnodes").updateOne({nodeId: "ffe6addb-6458-4162-b788-92ee174cf50c"}, {$set: {gossipEndpoint: "159.65.224.93:9735"}})
  });
};

export const down = async (db: mongo.Db, client: mongo.MongoClient) => {
  await withTransaction(client, async (session: mongo.ClientSession) => {
    // Migration down code here.
    await db.collection("lightningnodes").updateMany({}, {$unset: {gossipEndpoint: ""}})
  });
};
