import * as mongo from "mongodb";
import { withTransaction } from "../helpers/withTransaction";

export const up = async (db: mongo.Db, client: mongo.MongoClient) => {
  await withTransaction(client, async (session: mongo.ClientSession) => {
    const usersWithDupeTenants = await db.collection('userdetails').aggregate([
      {
        $unwind: "$tenants" // Split the array into separate documents
      },
      {
        $group: {
          _id: {
            _id: "$_id", // Preserve the original document _id
            arrayElement: "$tenants" // Group by each array element
          },
          count: { $sum: 1 } // Count occurrences of each array element
        }
      },
      {
        $match: {
          count: 2 // Filter groups with count = 2
        }
      },
      {
        $project: {
          _id: "$_id._id", // Restore the original document _id
          arrayField: "$_id.tenants"
        }
      }
    ])
    for await (const userWithDupeTenant of usersWithDupeTenants) {
      const user = await db.collection('userdetails').findOne({ _id: userWithDupeTenant._id });
      if (user) {
        // user.tenants = user?.tenants.slice(1);
        await db.collection('userdetails').findOneAndUpdate({ _id: user._id }, { $set: { tenants: user.tenants.slice(1) } })
      }
    }
  });
};


