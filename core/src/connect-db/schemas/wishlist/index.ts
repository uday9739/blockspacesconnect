import { Schema, SchemaTypes } from "mongoose";
import { Wishlist } from "@blockspaces/shared/models/wishlist";

export const WishlistSchema = new Schema<Wishlist>({
  userId: {
    type: String,
    required: true
  },
  connectorId: {
    type: String,
    required: false
  },
  offerId: {
    type: String,
    required: false
  },
  networkId: {
    type: String,
    required: false
  }
});