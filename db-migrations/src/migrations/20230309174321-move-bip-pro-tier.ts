import * as mongo from "mongodb";
import { withTransaction } from "../helpers/withTransaction";

export const up = async (db: mongo.Db, client: mongo.MongoClient) => {
  await withTransaction(client, async (session: mongo.ClientSession) => {
    // Migration up code here.


    const billingtierProfessional = await db.collection("billingtiers").findOne({ "code": "Professional" });

    const offer = await db.collection("networkofferings").findOne({ network: "lightning", title: "Standard" });

    await db.collection("networkofferings").updateOne({ _id: offer?._id },
      {
        $set: {
          "title": "Professional",
          "billingTier": billingtierProfessional?._id
        },
      },
      { upsert: false }
    );

  });
};

export const down = async (db: mongo.Db, client: mongo.MongoClient) => {
  await withTransaction(client, async (session: mongo.ClientSession) => {
    // Migration down code here.
  });
};
