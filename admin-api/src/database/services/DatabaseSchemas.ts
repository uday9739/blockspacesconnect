import { LightningNodesSchema } from "../schemas/lightning/LightningNodesSchema";
import { UserSchema } from "../schemas/users/UserSchema";

export class DatabaseSchemas {
  constructor() {

  }

  getSchemas() {
    const schemas = [
      {
        name: 'LightningNodes',
        schema: LightningNodesSchema
      },
      {
        name: 'Users',
        schema: UserSchema
      }
    ]
  }
}