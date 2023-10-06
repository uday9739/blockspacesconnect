import { Schema } from "mongoose";
import { RevokedToken } from "@blockspaces/shared/models/users"

const RevokedTokenSchema = new Schema<RevokedToken>({
  tokenId: {
    type: String,
    required: [true, "JWT token id is required."],
    unique: true
  },
  expiry: {
    type: Number,
    required: [true, "Token expiry is required."]
  }
})

RevokedTokenSchema.index({tokenId: 1})
export { RevokedTokenSchema }