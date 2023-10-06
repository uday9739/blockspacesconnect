import { Schema } from "mongoose";
import { LightningNodeReference } from "@blockspaces/shared/models/lightning/Node";

export const LightningNodesSchema = new Schema<LightningNodeReference>(
  {
    nodeId: {
      type: String,
      required: [true, "NodeId is required."],
      unique: true
    },
    pubkey: {
      type: String,
      unique: true,
      sparse: true
    },
    tenantId: {
      type: String,
    },
    nodeLabel: {
      type: String,
      required: false
    },
    outgoingChannelId: {
      type: String,
    },
    incomingChannelId: {
      type: String,
    },
    apiEndpoint: {
      type: String,
      required: [true, "ApiEndpoint is required."]
    },
    gossipEndpoint: {
      type: String,
    },
    bscMacaroon: {
      type: String,
    },
    macaroonId: {
      type: String,
    },
    cert: {
      type: String,
    },
    decomissioned: {
      type: Boolean
    },
    tier: {
      type: String,
    },
    external: {
      type: Boolean,
    },
    nodeBirthday: {
      type: Date,
    }
  },
);
