import * as mongo from "mongodb";
import { withTransaction } from "../helpers/withTransaction";

export const up = async (db: mongo.Db, client: mongo.MongoClient) => {
  await withTransaction(client, async (session: mongo.ClientSession) => {
    const updatedFeatureFlags = {
      featureOne: false,
      billingModule: true,
      lightningSelfServiceCancel: true,
      withdrawBitcoin: true,
      cyclrUserBIP: false,
      embedBMP: false,
      tenantsModule: false
    };
    const users = await db.collection<any>("userdetails").find({}).toArray();
    users.forEach(async (user) => {
      console.log(user.id);
      await db
        .collection<any>("userdetails")
        .updateOne({ id: user.id }, { $set: { "featureFlags.billingModule": true, "featureFlags.lightningSelfServiceCancel": true, "featureFlags.withdrawBitcoin": true } });
    });
  });
};

export const down = async (db: mongo.Db, client: mongo.MongoClient) => {
  await withTransaction(client, async (session: mongo.ClientSession) => {
    const oldFeatureFlags = {
      featureOne: false,
      billingModule: false,
      lightningSelfServiceCancel: false,
      withdrawBitcoin: false,
      cyclrUserBIP: false,
      embedBMP: false,
      tenantsModule: false
    };

    const users = await db.collection<any>("userdetails").find({}).toArray();
    users.forEach(async (user) => {
      console.log(user.id);
      await db
        .collection<any>("userdetails")
        .updateOne({ id: user.id }, { $set: { "featureFlags.billingModule": false, "featureFlags.lightningSelfServiceCancel": false, "featureFlags.withdrawBitcoin": false } });
    });
  });
};
