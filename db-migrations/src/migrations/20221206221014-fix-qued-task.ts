import { timingSafeEqual } from "crypto";
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

    const targetIds = ["63641a04f98be3c7318f50a7", "63693b62fcfdd28bec65a499", "636a722afcfdd28bec65b6b0", "636db13aeb8e860075b60bec"];
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
            }
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


// The above migration was tested with sample data from below

// const sampleConnectSubscription = {
//   "_id": {
//     "$oid": "638a5f2870bb4d8c63603cd5"
//   },
//   "userId": "d98378e9-94de-461f-b521-9fd81caf87e7",
//   "createdOn": 1670012712748,
//   "paymentMethod": "Fiat",
//   "status": "Canceled",
//   "recurrence": "monthly",
//   "networks": [
//     "ethereum"
//   ],
//   "billingInfo": {
//     "fullName": "Randy Fuentes",
//     "addressLine1": "90210",
//     "addressLine2": "",
//     "state": "FL",
//     "city": "Miami",
//     "postalCode": "33143",
//     "country": "Miami",
//     "_id": {
//       "$oid": "638a5f2870bb4d8c63603cd6"
//     }
//   },
//   "usageAuditTrail": [
//     {
//       "billingCode": "DEV_ENDPOINT_TRANSACTION",
//       "connectSubscriptionItemId": "638a5f2970bb4d8c63603cdc",
//       "unitQuantity": 0,
//       "meteredUsageStart": 1670012712000,
//       "meteredUsageEnd": 1672549199999,
//       "timestamp": 1670013296440
//     }
//   ],
//   "items": [
//     {
//       "stripeItemId": "si_MuUmCxSfwNm5VV",
//       "networkPrice": {
//         "$oid": "6388d7abc4e8495818000b77"
//       },
//       "networkId": "ethereum",
//       "userNetwork": {
//         "$oid": "638a601670bb4d8c63603d34"
//       },
//       "dateAdded": 1670012713824,
//       "_id": {
//         "$oid": "638a5f2970bb4d8c63603cdb"
//       }
//     },
//     {
//       "stripeItemId": "si_MuUmyHdR2CihYi",
//       "networkPrice": {
//         "$oid": "6388d7abc4e8495818000b78"
//       },
//       "networkId": "ethereum",
//       "userNetwork": {
//         "$oid": "638a601670bb4d8c63603d34"
//       },
//       "dateAdded": 1670012713824,
//       "_id": {
//         "$oid": "638a5f2970bb4d8c63603cdc"
//       }
//     }
//   ],
//   "__v": 3,
//   "currentPeriod": {
//     "billingStart": 1670012712,
//     "billingEnd": 1672691112,
//     "meteredUsageStart": 1670012712000,
//     "meteredUsageEnd": 1672549199999,
//     "_id": {
//       "$oid": "638a5f2970bb4d8c63603cdd"
//     }
//   },
//   "stripeSubscriptionId": "sub_1MAfnJDwwP2dBiY2QrySNfPq",
//   "scheduledTaskId": "638a601670bb4d8c63603d37"
// };
// const sampleTask = [{
//   "_id": {
//     "$oid": "63641a04f98be3c7318f50a7"
//   },
//   "type": "REPORT_SUBSCRIPTION_USAGE",
//   "runDate": {
//     "$numberLong": "1669939199999"
//   },
//   "createdOn": {
//     "$numberLong": "1667504644055"
//   },
//   "payload": {
//     "connectSubscriptionId": "638a5f2870bb4d8c63603cd5"
//   },
//   "recurrence": "MONTHLY",
//   "attempts": 10,
//   "status": "ERROR",
//   "auditTrail": [
//     {
//       "timestamp": {
//         "$numberLong": "1669939201794"
//       },
//       "outcome": "ERROR",
//       "payload": "",
//       "_id": {
//         "$oid": "6389400130b32fb6a0feeb4a"
//       }
//     },
//     {
//       "timestamp": {
//         "$numberLong": "1669939500729"
//       },
//       "outcome": "ERROR",
//       "payload": "",
//       "_id": {
//         "$oid": "6389412c30b32fb6a0feec2b"
//       }
//     },
//     {
//       "timestamp": {
//         "$numberLong": "1669939800668"
//       },
//       "outcome": "ERROR",
//       "payload": "",
//       "_id": {
//         "$oid": "6389425830b32fb6a0feed0c"
//       }
//     },
//     {
//       "timestamp": {
//         "$numberLong": "1669940100664"
//       },
//       "outcome": "ERROR",
//       "payload": "",
//       "_id": {
//         "$oid": "6389438430b32fb6a0feeded"
//       }
//     },
//     {
//       "timestamp": {
//         "$numberLong": "1669940400594"
//       },
//       "outcome": "ERROR",
//       "payload": "",
//       "_id": {
//         "$oid": "638944b030b32fb6a0feeece"
//       }
//     },
//     {
//       "timestamp": {
//         "$numberLong": "1669940700654"
//       },
//       "outcome": "ERROR",
//       "payload": "",
//       "_id": {
//         "$oid": "638945dc30b32fb6a0feefaf"
//       }
//     },
//     {
//       "timestamp": {
//         "$numberLong": "1669941000602"
//       },
//       "outcome": "ERROR",
//       "payload": "",
//       "_id": {
//         "$oid": "6389470830b32fb6a0fef090"
//       }
//     },
//     {
//       "timestamp": {
//         "$numberLong": "1669941300720"
//       },
//       "outcome": "ERROR",
//       "payload": "",
//       "_id": {
//         "$oid": "6389483430b32fb6a0fef171"
//       }
//     },
//     {
//       "timestamp": {
//         "$numberLong": "1669941600694"
//       },
//       "outcome": "ERROR",
//       "payload": "",
//       "_id": {
//         "$oid": "6389496030b32fb6a0fef252"
//       }
//     },
//     {
//       "timestamp": {
//         "$numberLong": "1669941900619"
//       },
//       "outcome": "ERROR",
//       "payload": "",
//       "_id": {
//         "$oid": "63894a8c30b32fb6a0fef333"
//       }
//     }
//   ],
//   "__v": 10,
//   "updatedOn": {
//     "$numberLong": "1669941900619"
//   }
// },
// {
//   "_id": {
//     "$oid": "63693b62fcfdd28bec65a499"
//   },
//   "type": "REPORT_SUBSCRIPTION_USAGE",
//   "runDate": {
//     "$numberLong": "1670284799999"
//   },
//   "createdOn": {
//     "$numberLong": "1667840866500"
//   },
//   "payload": {
//     "connectSubscriptionId": "638a5f2870bb4d8c63603cd5"
//   },
//   "recurrence": "MONTHLY",
//   "attempts": 10,
//   "status": "ERROR",
//   "auditTrail": [
//     {
//       "timestamp": {
//         "$numberLong": "1670284801163"
//       },
//       "outcome": "ERROR",
//       "payload": "",
//       "_id": {
//         "$oid": "638e8601132e88de78987594"
//       }
//     },
//     {
//       "timestamp": {
//         "$numberLong": "1670285100960"
//       },
//       "outcome": "ERROR",
//       "payload": "",
//       "_id": {
//         "$oid": "638e872c132e88de78987681"
//       }
//     },
//     {
//       "timestamp": {
//         "$numberLong": "1670285400716"
//       },
//       "outcome": "ERROR",
//       "payload": "",
//       "_id": {
//         "$oid": "638e8858132e88de7898776e"
//       }
//     },
//     {
//       "timestamp": {
//         "$numberLong": "1670285700905"
//       },
//       "outcome": "ERROR",
//       "payload": "",
//       "_id": {
//         "$oid": "638e8984132e88de7898785b"
//       }
//     },
//     {
//       "timestamp": {
//         "$numberLong": "1670286000706"
//       },
//       "outcome": "ERROR",
//       "payload": "",
//       "_id": {
//         "$oid": "638e8ab0132e88de78987948"
//       }
//     },
//     {
//       "timestamp": {
//         "$numberLong": "1670286300621"
//       },
//       "outcome": "ERROR",
//       "payload": "",
//       "_id": {
//         "$oid": "638e8bdc132e88de78987a35"
//       }
//     },
//     {
//       "timestamp": {
//         "$numberLong": "1670286600683"
//       },
//       "outcome": "ERROR",
//       "payload": "",
//       "_id": {
//         "$oid": "638e8d08132e88de78987b22"
//       }
//     },
//     {
//       "timestamp": {
//         "$numberLong": "1670286900786"
//       },
//       "outcome": "ERROR",
//       "payload": "",
//       "_id": {
//         "$oid": "638e8e34132e88de78987c0f"
//       }
//     },
//     {
//       "timestamp": {
//         "$numberLong": "1670287200651"
//       },
//       "outcome": "ERROR",
//       "payload": "",
//       "_id": {
//         "$oid": "638e8f60132e88de78987cfc"
//       }
//     },
//     {
//       "timestamp": {
//         "$numberLong": "1670287500600"
//       },
//       "outcome": "ERROR",
//       "payload": "",
//       "_id": {
//         "$oid": "638e908c132e88de78987de9"
//       }
//     }
//   ],
//   "__v": 10,
//   "updatedOn": {
//     "$numberLong": "1670287500600"
//   }
// },
// {
//   "_id": {
//     "$oid": "636a722afcfdd28bec65b6b0"
//   },
//   "type": "REPORT_SUBSCRIPTION_USAGE",
//   "runDate": {
//     "$numberLong": "1670371199999"
//   },
//   "createdOn": {
//     "$numberLong": "1667920426515"
//   },
//   "payload": {
//     "connectSubscriptionId": "638a5f2870bb4d8c63603cd5"
//   },
//   "recurrence": "MONTHLY",
//   "attempts": 0,
//   "status": "QUEUED",
//   "auditTrail": [],
//   "__v": 0
// },
// {
//   "_id": {
//     "$oid": "636db13aeb8e860075b60bec"
//   },
//   "type": "REPORT_SUBSCRIPTION_USAGE",
//   "runDate": {
//     "$numberLong": "1670630399999"
//   },
//   "createdOn": {
//     "$numberLong": "1668133178252"
//   },
//   "payload": {
//     "connectSubscriptionId": "638a5f2870bb4d8c63603cd5"
//   },
//   "recurrence": "MONTHLY",
//   "attempts": 0,
//   "status": "QUEUED",
//   "auditTrail": [],
//   "__v": 0
// }]