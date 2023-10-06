import { NetworkCuratedResource, NetworkCuratedResources } from "@blockspaces/shared/models/network-catalog";
import { Schema, SchemaTypes } from "mongoose";

export const NetworkCuratedResourcesSchema = new Schema<NetworkCuratedResources>({
  network: {
    type: SchemaTypes.String,
    ref: 'Network',
    required: [true, 'Network for resource is required']
  },
  resources: {
    type: [new Schema<NetworkCuratedResource>({
      category: {
        type: SchemaTypes.String,
        required: [true, 'Network resource category is required']
      },
      type: {
        type: SchemaTypes.String,
        required: [true, 'Network resource type is required']
      },
      source: {
        type: SchemaTypes.String,
        required: [true, 'Network resource source is required']
      },
      url: {
        type: SchemaTypes.String,
        required: [true, 'Network resource url is required']
      },
      description: {
        type: SchemaTypes.String,
        required: [true, 'Network resource description is required']
      }
    })]
  }
});