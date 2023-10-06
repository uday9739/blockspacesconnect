import * as mongo from "mongodb";
import { withTransaction } from "../helpers/withTransaction";

export const up = async (db: mongo.Db, client: mongo.MongoClient) => {
  await withTransaction(client, async (session: mongo.ClientSession) => {
    for (let i = 0; i < ids.length; i++) {
      await db.collection("networks").findOneAndReplace({ _id: { $eq: ids[i]._id } }, { ...insertData[i] }, { session: session, returnDocument: "after" });
    }
  });
};

const ids: any[] = [
  {
    _id: "polygon",
  },
  {
    _id: "ethereum",
  },
  {
    _id: "lightning",
  },
  {
    _id: "pocket",
  }
]
const insertData: any[] = [
  {
    "name": "Polygon Endpoint",
    "logo": "/images/chain-logos/polygon.png",
    "description": "Interact with Polygon Mainnet through your own dedicated endpoint",
    "primaryColor": "#8247e5",
    "secondaryColor": "#6C21EA",
    "protocolRouterBackend": "poly-mainnet_be"
  },
  {
    "name": "Ethereum Endpoint",
    "logo": "/images/chain-logos/ethereum.png",
    "description": "Ethereum Mainnet",
    "primaryColor": "#9799e7",
    "secondaryColor": "#c6cbfa",
    "protocolRouterBackend": "eth-mainnet_be"
  },
  {
    "name": "Bitcoin Invoicing & Payments",
    "logo": "/images/light-lightningnetwork.png",
    "description": "Lightning Fast, Low-Fee, Payments & Invoicing",
    "primaryColor": "#7B1AF7",
    "secondaryColor": "#BE1AF7"
  },
  {
    "name": "Pocket Staking",
    "logo": "/images/light-pocketnetwork.png",
    "description": "Decentralized Blockchain Infrastructure",
    "primaryColor": "#37AFED",
    "secondaryColor": "#1D8AED"
  }
];