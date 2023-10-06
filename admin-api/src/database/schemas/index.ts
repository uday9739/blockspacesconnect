import { Injectable } from "@nestjs/common";
import { AdminPortalUserSchema } from "./adminportal/AdminPortalUserSchema";
import { LightningNodesSchema } from "./lightning/LightningNodesSchema";
import { UserSchema } from "./users/UserSchema";
import { InjectModel, ModelDefinition } from "@nestjs/mongoose";

export const ConnectSchemas: ModelDefinition[] = [
  { name: 'LightningNodes', schema: LightningNodesSchema },
  { name: 'UserDetails', schema: UserSchema }
];

export const AdminPortalSchemas: ModelDefinition[] = [
  //{ name: 'AdminPortalUsers', schema: AdminPortalUserSchema }
]

