import { UserNetwork, UserNetworkStatus } from "@blockspaces/shared/models/networks";
import { Schema } from "mongoose";

/**
 * Mongoose schema for the UserNetworks collection, without any network-specific data
 *
 * To define schemas that include network-specific data, use Mongoose's discriminator functionality to build models that extend this schema, and include a subdocument schema for the network-specific data.
 *
 * Example with discriminator and subdocument schema:
 *
 * ```
 * // base model
 * const UserNetworkModel = mongoose.model("UserNetwork", USER_NETWORK_SCHEMA);
 *
 * // extended Lightning Network specific model with discriminator + subdocument schema
 * const UserNetworkModelWithLightning = UserNetworkModel.discriminator<UserNetwork<LightningNetwork>, typeof UserNetworkModel>(
 *   "UserNetworkWithLightning",
 *   new mongoose.Schema({
 *     networkId: {
 *       type: String,
 *       validate: (x) => x === NetworkId.LIGHTNING
 *     },
 *     networkData: LIGHTNING_NETWORK_SCHEMA // subdocument schema for lightning network data
 *   })
 * );
 * ```
 *
 * @see https://mongoosejs.com/docs/discriminators.html
 * @see https://mongoosejs.com/docs/subdocs.html
 */
export const USER_NETWORKS_SCHEMA_NAME = "UserNetwork";
export const UserNetworkSchema = new Schema<UserNetwork>(
  {
    networkId: {
      type: String,
      ref: `Network`,
      required: true
    },

    userId: {
      type: String,
      required: true,
      index: true
    },
    status: {
      type: String,
      enum: Object.values(UserNetworkStatus).concat(null),
      required: false
    },
    billingCategory: {
      type: Schema.Types.ObjectId,
      ref: `NetworkPriceBillingCategory`,
      required: [true, "Billing Category _id is required"]
    },
    billingTier: {
      type: Schema.Types.ObjectId,
      ref: `BillingTier`,
      required: [true, "tier is required"]
    },
  },
  {
    timestamps: true,
    // optimisticConcurrency: true, //conflicts with discriminatorKey
    discriminatorKey: "type"
  }
);


