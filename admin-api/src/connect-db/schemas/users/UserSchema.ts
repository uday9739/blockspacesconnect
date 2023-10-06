import { Address } from "@blockspaces/shared/models/Address";
import { IUser, UnregisteredUser } from "@blockspaces/shared/models/users";
import { Schema } from "mongoose";
import { AddressSchemaDefinition } from "./AddressSchema";

/** a required validator function that will return true if the user is registered */
const requireIfRegistered = function () {
  return (<IUser>this).registered;
};

export const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      unique: true,
      required: [true, "Email address is required"]
    },

    id: {
      type: String,
      unique: true,
      sparse: true,
      required: [requireIfRegistered, "User ID is required"]
    },

    registered: {
      type: Boolean,
      default: false
    },

    tenants: {
      type: [String],
      required: [requireIfRegistered, "Tenant Array is required"]
    },

    migratedUser: {
      type: Boolean,
      default: false
    },

    firstLogin: {
      type: Boolean,
      default: true
    },

    featureFlags: {
      _id: false,
      featureOne: {
        type: Boolean,
        default: false,
        required: [true, "featureOne Flag is Required"]
      },
      billingModule: {
        type: Boolean,
        default: false,
      },
      lightningSelfServiceCancel: {
        type: Boolean,
        default: false,
      },
      withdrawBitcoin: {
        type: Boolean,
        default: false
      },
      cyclrUserBIP: {
        type: Boolean,
        default: false
      },
      embedBMP: {
        type: Boolean,
        default: false
      },
      tenantsModule: {
        type: Boolean,
        default: false
      },
    },

    whmcs: {
      _id: false,
      clientId: {
        type: Number,
      },
      ownerId: Number
    },

    serviceNow: {
      _id: false,

      sysId: { type: String },
      account: { type: String }
    },

    twoFAStatus: {
      type: String,
      required: [requireIfRegistered, "2FA is required"]
    },

    firstName: {
      type: String,
    },

    lastName: {
      type: String,
    },

    tosDate: {
      type: String
    },
    crmContactId: {
      type: String
    },
    qboCustomerId: {
      type: String
    },
    qboAccountId: {
      type: String
    },
    viewedWelcome: Boolean,

    billingDetails: {
      stripe: {
        customerId: String,
      },
      quickbooks: {
        customerRef: {
          name: String,
          value: String,
        },
      },
    },
    appSettings: {
      _id: false,
      defaultPage: String,
      bip: {
        displayFiat: Boolean
      }
    },
    gaScore: {
      type: Number
    },
    accountLocked: {
      type: Boolean
    },
    createdAt: {
      type: String
    },
    emailVerified: {
      type: Boolean
    },
    // TODO add validation to ensure that each element in the array is a valid NetworkId value
    connectedNetworks: [String],

    address: new Schema<Address>(AddressSchemaDefinition, { _id: false }),
    companyName: String,
    phone: String
  },
  {
    timestamps: true,
    bufferCommands: false
  }
);

/**
 * Schema for unregistered users
 *
 * This is identical to {@link UserSchema}, other than the fact that it is typed
 * specifically to support the {@link UnregisteredUser} data model
 */
export const UnregisteredUserSchema: Schema<UnregisteredUser> = UserSchema.clone();
