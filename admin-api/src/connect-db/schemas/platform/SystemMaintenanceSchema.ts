import { Schema } from "mongoose";
// export const SystemMaintenanceSchema: Schema<Record<string, any>> = new Schema({}
//   , { toJSON: { transform: function (doc, ret) { delete ret.__v; } } }
// );

export class SystemMaintenance {
  cyclrSystem?: boolean;
  userRegistrationRecaptcha?: boolean;
  maintenance?: boolean;
  FreeWeb3EndpointTransactionLimit?: number;
}
export const SystemMaintenanceSchema = new Schema<SystemMaintenance>({
  cyclrSystem: {
    type: Schema.Types.Boolean,
    required: false
  },
  userRegistrationRecaptcha: {
    type: Schema.Types.Boolean,
    required: false
  },
  maintenance: {
    type: Schema.Types.Boolean,
    required: false
  },
  FreeWeb3EndpointTransactionLimit: {
    type: Schema.Types.Number,
    required: false
  }
});