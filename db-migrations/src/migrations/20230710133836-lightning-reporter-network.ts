import * as mongo from "mongodb";
import { withTransaction } from "../helpers/withTransaction";

export const up = async (db: mongo.Db, client: mongo.MongoClient) => {
  await withTransaction(client, async (session: mongo.ClientSession) => {
    const lightningReporter = {
      _id: "lightning-reporter",
      name: "Lightning Reporter",
      logo: "/images/light-lightning-reporter.png",
      description: "Track your Lightning node's transactions to your accounting software.",
      primaryColor: "#FF3C00",
      secondaryColor: "#FF9300"
    }

    await db.collection<any>("networks").insertOne(lightningReporter)
  });
};

export const down = async (db: mongo.Db, client: mongo.MongoClient) => {
  await withTransaction(client, async (session: mongo.ClientSession) => {
    await db.collection<any>("networks").deleteOne({_id: "lightning-reporter"})
    // Migration down code here.
  });
};
