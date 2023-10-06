import { BillingAddress, Cart, CartItem, CartStatus } from "@blockspaces/shared/models/cart";
import { CountryCode } from "@blockspaces/shared/models/Countries";

import { Schema } from "mongoose";

export const BillingAddressSchema = new Schema<BillingAddress>({
  fullName: {
    type: String,
    required: [true, "full name is required"],
  },
  addressLine1: {
    type: String,
    required: [true, "address line 1 is required"],
  },
  addressLine2: {
    type: String
  },
  state: {
    type: String,
    required: [
      function (): boolean {
        return (this as BillingAddress)?.country?.toLowerCase() === CountryCode.UnitedStates.toLowerCase();
      },
      `state/province is required`
    ]
  },
  city: {
    type: String
  },
  postalCode: {
    type: String,
    required: [
      function (): boolean {
        return (this as BillingAddress)?.country?.toLowerCase() === CountryCode.UnitedStates.toLowerCase();
      },
      `postal code is required`
    ]
  },
  country: {
    type: String,
    required: [true, "country is required"],
  }
});

const CartItemSchema = new Schema<CartItem>({
  offer: {
    type: Schema.Types.ObjectId,
    ref: 'NetworkOffering',
    required: [true, "network offer is required"],
  }
});

export const CartSchema = new Schema<Cart>({
  date: {
    type: Date,
    required: [true, "date is required"],
  },
  networkId: {
    type: String,
    required: [true, "networkId is required"],
  },
  userId: {
    type: String,
    required: [true, "userId is required"],
  },
  status: {
    type: String,
    enum: Object.values(CartStatus),
    default: CartStatus.EMPTY,
    required: [true, "status is required"]
  },
  connectSubscriptionId: {
    type: Schema.Types.String
  },
  billingAddress: {
    type: BillingAddressSchema,
    required: [
      function (): boolean {
        return (this as Cart)?.status === CartStatus.PENDING_CC_INFO;

      },
      `Billing information is required`
    ]
  },
  items: {
    type: [CartItemSchema],
    required: [
      function (): boolean {
        return (this as Cart)?.status !== CartStatus.EMPTY;
      },
      `items are required`
    ]
  },
  cartError: {
    type: {
      code: String,
      message: String
    },
    required: false
  },
  billingCategory: {
    type: Schema.Types.ObjectId,
    ref: `NetworkPriceBillingCategory`,
    required: [false, "Billing Category _id is required"]
  },
});