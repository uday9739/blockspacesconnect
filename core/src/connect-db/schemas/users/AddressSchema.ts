import { SchemaDefinition, SchemaDefinitionType } from "mongoose";
import { Address } from "@blockspaces/shared/models/Address";
import { CountryCode } from "@blockspaces/shared/models/Countries";

/**
 * Schema definition for address objects.
 * Use this definition to create subdocument schemas or nested paths in other schemas
 *
 * ----
 * Example 1: Subdocument schema
 * ```
  const someOtherSchema = new Schema<ModelType>({
    address: new Schema<Address>(AddressSchemaDefinition)
  });
 * ```
 *
 * ----
 * Example 2: Nested paths
 * ```
  const someOtherSchema = new Schema<ModelType>({
    address: {
      ...AddressSchemaDefinition,
      _id: false
    }
  });
 * ```
 */
export const AddressSchemaDefinition: SchemaDefinition<SchemaDefinitionType<Address>> = {
  address1: { required: true, type: String },
  address2: String,
  city: { required: true, type: String },
  country: String,
  state: {
    type: String,
    required: [
      function (): boolean {
        return (this as Address)?.country?.toLowerCase() === CountryCode.UnitedStates.toLowerCase();
      },
      `state/province is required`
    ]
  },
  zipCode: {
    type: String,
    required: [
      function (): boolean {
        return (this as Address)?.country?.toLowerCase() === CountryCode.UnitedStates.toLowerCase();
      },
      `postal code is required`
    ]
  },
};