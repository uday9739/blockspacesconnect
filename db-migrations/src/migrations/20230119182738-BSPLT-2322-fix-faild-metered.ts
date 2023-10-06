import * as mongo from "mongodb";
import { withTransaction } from "../helpers/withTransaction";

export const up = async (db: mongo.Db, client: mongo.MongoClient) => {
  await withTransaction(client, async (session: mongo.ClientSession) => {
    // Migration up code here.
    const taskqueueitemsExists = await db.listCollections({ name: "taskqueueitems" }).hasNext();
    if (!taskqueueitemsExists) {
      return;
    }
    const connectsubscriptionsExists = await db.listCollections({ name: "connectsubscriptions" }).hasNext();
    if (!connectsubscriptionsExists) {
      return;
    }

    const targetIds = ["63641a04f98be3c7318f50a7", "63693b62fcfdd28bec65a499", "636a722afcfdd28bec65b6b0", "636db13aeb8e860075b60bec"]; // usual suspects
    const tasks = await db.collection<TaskQueueItem>("taskqueueitems").find({ status: "ERROR", _id: { $in: targetIds.map(x => new mongo.ObjectId(x)) } });

    for await (const task of tasks) {
      const connectSubscription = await db.collection<ConnectSubscription>("connectsubscriptions").findOne({ _id: new mongo.ObjectId(task.payload.connectSubscriptionId) });
      if (connectSubscription) {
        await db.collection("taskqueueitems").updateOne({ _id: task._id },
          {
            $set: {
              "runDate": connectSubscription.currentPeriod.meteredUsageEnd,
              "attempts": 0,
              "status": "QUEUED"
            },
            // remove error's from auditTrail
            $pull: { "auditTrail": { "outcome": "ERROR" } }
          },
          { upsert: false }
        );
      }
    }

  });
};

export const down = async (db: mongo.Db, client: mongo.MongoClient) => {
  await withTransaction(client, async (session: mongo.ClientSession) => {
    // Migration down code here.
  });
};

interface ConnectSubscription {
  currentPeriod: {
    meteredUsageEnd: number
  }
}

interface TaskQueueItem {
  type: string
  payload: {
    connectSubscriptionId: string
  }
  runDate: number
  attempts: number
  status: string
}

