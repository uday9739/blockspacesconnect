import * as mongo from "mongodb";
import { withTransaction } from "../helpers/withTransaction";

export const up = async (db: mongo.Db, client: mongo.MongoClient) => {
  await withTransaction(client, async (session: mongo.ClientSession) => {
    await db.collection("networkcuratedresources").insertMany(lndResources, {session})
  });
};

export const down = async (db: mongo.Db, client: mongo.MongoClient) => {
  await withTransaction(client, async (session: mongo.ClientSession) => {
    await db.collection("networkcuratedresources").deleteOne({network: "lightning-connect"})
  });
};

const lndResources = [
  {
    network: "lightning-connect",
    resources: [
      {
        category: "Network Explorer",
        type: "Mainnet",
        source: "Amboss",
        url: "https://amboss.space",
        description: "Lightning Network node explorer"
      },
      {
        category: "Documentation",
        type: "Protocol Documentation",
        source: "Lightning Labs",
        url: "https://docs.lightning.engineering/",
        description: "The builders guide to LND."
      },
      {
        category: "Documentation",
        type: "Protocol Documentation",
        source: "Jameson Lopp",
        url: "https://lightning.how",
        description: "Lightning Protocol Resources"
      },
      {
        category: "API Documentation",
        type: "gRPC API",
        source: "Lightning Labs",
        url: "https://lightning.engineering/api-docs/api/lnd/index.html",
        description: "LND gRPC Documentation"
      },
      {
        category: "Community",
        type: "Stack Exchange",
        source: "Stack Exchange",
        url: "https://bitcoin.stackexchange.com/questions/tagged/lightning-network",
        description: "Lightning Stack Overflow"
      },
      {
        category: "API Documentation",
        type: "REST API",
        source: "Lightning Labs",
        url: "https://lightning.engineering/api-docs/api/lnd/rest-endpoints",
        description: "LND REST Endpoints Documentation"
      },
      {
        category: "Community",
        type: "Slack",
        source: "Lightning Labs",
        url: "https://lightningcommunity.slack.com/",
        description: "LND Developer Slack"
      },
      {
        category: "Tools",
        type: "NodeJS",
        source: "Github",
        url: "https://github.com/alexbosworth/ln-service",
        description: "LND NodeJS Interface"
      },
      {
        category: "Tools",
        type: "Invoice Decoder",
        source: "LNDecode",
        url: "https://lndecode.com/",
        description: "Decode Lightning Invoices"
      },
      {
        category: "Tools",
        type: "Wallet",
        source: "Zeus",
        url: "https://github.com/ZeusLN/zeus",
        description: "Mobile App to connect your node"
      },
      {
        category: "Documentation",
        type: "Resources",
        source: "Awesome Lightning",
        url: "https://github.com/bcongdon/awesome-lightning-network/blob/master/readme.md",
        description: "Awesome Lightning Network"
      }
    ]
  }
]