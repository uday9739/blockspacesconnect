import * as mongo from "mongodb";
import { withTransaction } from "../helpers/withTransaction";

export const up = async (db: mongo.Db, client: mongo.MongoClient) => {
  await withTransaction(client, async (session: mongo.ClientSession) => {
    // Migration up code here.
    const connectsubscriptionsExists = await db.listCollections({ name: "connectsubscriptions" }).hasNext();
    if (!connectsubscriptionsExists) {
      return;
    }
    const connectSubscriptionInvoicesExists = await db.listCollections({ name: "connectsubscriptioninvoices" }).hasNext();
    if (!connectSubscriptionInvoicesExists) {
      return;
    }
    const userdetailsExists = await db.listCollections({ name: "userdetails" }).hasNext();
    if (!userdetailsExists) {
      return;
    }

    const allConnectSubscriptions = await db.collection<ConnectSubscriptionAndOrInvoice>("connectsubscriptions").find();
    for await (const sub of allConnectSubscriptions) {
      const user = await db.collection<IUser>("userdetails").findOne({ id: sub.userId });
      if (user) {
        await db.collection("connectsubscriptions").updateOne({ _id: sub._id },
          {
            $set: {
              "tenantId": user.tenants[0]
            },
          },
          { upsert: false }
        );
      }
    }

    const allConnectSubscriptionInvoices = await db.collection<ConnectSubscriptionAndOrInvoice>("connectsubscriptioninvoices").find();
    for await (const invoice of allConnectSubscriptionInvoices) {
      const user = await db.collection<IUser>("userdetails").findOne({ id: invoice.userId });
      if (user) {
        await db.collection("connectsubscriptioninvoices").updateOne({ _id: invoice._id },
          {
            $set: {
              "tenantId": user.tenants[0]
            },
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

interface ConnectSubscriptionAndOrInvoice {
  tenantId: string,
  userId: string;
}
interface IUser {
  tenants: string[];
  id: string;
}