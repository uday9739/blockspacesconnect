import * as mongo from "mongodb";
import { withTransaction } from "../helpers/withTransaction";

export const up = async (db: mongo.Db, client: mongo.MongoClient) => {
  await withTransaction(client, async (session: mongo.ClientSession) => {
    await db.collection<any>("networks").insertOne(lightningConnect)
  });
};

export const down = async (db: mongo.Db, client: mongo.MongoClient) => {
  await withTransaction(client, async (session: mongo.ClientSession) => {
    // Migration down code here.
    await db.collection<any>("networks").deleteOne({name: "Lightning Connect"})
  });
};

const lightningConnect = {
  _id: "lightning-connect",
  name: "Lightning Connect",
  logo: "/images/light-lightningnetwork.png",
  description: "Lightning Node",
  primaryColor: "#7B1AF7",
  secondaryColor: "#BE1AF7"
}