import * as mongo from "mongodb";
import { withTransaction } from "../helpers/withTransaction";

export const up = async (db: mongo.Db, client: mongo.MongoClient) => {
  await withTransaction(client, async (session: mongo.ClientSession) => {
    // Migration up code here.
    db.collection('tenants').updateMany({}, [{ $set: { tenantType: "personal" } }, {
      $set: {
        users: {
          $map: {
            input: "$users",
            as: "userId",
            in: { userId: "$$userId", memberStatus: "active" }
          }
        }
      }
    }
    ]), { session }
  });
};