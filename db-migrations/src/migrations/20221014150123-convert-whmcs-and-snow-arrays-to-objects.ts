import * as mongo from "mongodb";
import { withTransaction } from "../helpers/withTransaction";

/**
 * Convert the `whmcs` and `serviceNow` properties from arrays to objects
 */
export const up = async (db: mongo.Db, client: mongo.MongoClient) => {
  await withTransaction(client, async (session: mongo.ClientSession) => {

    // WHMCS
    db.collection("userdetails").aggregate([
      { $match: { whmcs: { $type: 'array' } } },
      { $set: { whmcs: { $first: '$whmcs' } } },
      { $unset: 'whmcs._id' }
    ], {session});

    // ServiceNow
    db.collection("userdetails").aggregate([
      { $match: { serviceNow: { $type: 'array' } } },
      { $set: { serviceNow: { $first: '$serviceNow' } } },
      { $unset: 'serviceNow._id' }
    ], {session});
  });
};

/**
 * Convert the whmcs and serviceNow properties from objects back to arrays
 */
export const down = async (db: mongo.Db, client: mongo.MongoClient) => {
  await withTransaction(client, async (session: mongo.ClientSession) => {

    // WHMCS
    db.collection("userdetails").aggregate([
      { $match: { whmcs: { $type: 'object' } } },
      { $set: { whmcs: ['$whmcs'] } }
    ], { session });

    // ServiceNow
    await db.collection("userdetails").aggregate([
      { $match: { serviceNow: { $type: 'object' } } },
      { $set: { serviceNow: ['$serviceNow'] } }
    ], { session });
  });
};
