import { Document, SchemaTimestampsConfig, Types } from "mongoose";
import { ApiKey } from "@blockspaces/shared/models/platform/ApiKey"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"

export type ApiKeyDocument = ApiKeyClass & Document & SchemaTimestampsConfig;

@Schema({ timestamps: true })
export class ApiKeyClass implements ApiKey {
  @Prop({ required: [true, 'API Key Id required'] })
  id: string;

  @Prop({ required: [true, 'Tenant Id required'] })
  tenant_id: string;

  @Prop({ required: [true, 'API Key Name is required'] })
  name: string;

  @Prop({ required: [true, 'API Key Description is required'] })
  description: string;

  @Prop({ required: [true, 'API Key Application is required'] })
  application: string;

  @Prop({ required: [true, 'API Key Hash is required'] })
  hash: string;

  @Prop({ required: [true, 'Active/Inactive flag required'], default: true })
  active: boolean;
}

export const ApiKeySchema = SchemaFactory.createForClass(ApiKeyClass);