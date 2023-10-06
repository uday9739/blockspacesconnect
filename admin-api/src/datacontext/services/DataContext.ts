
import { Injectable } from "@nestjs/common";
import mongoose from "mongoose";
import AdminPortalUser from "../dtos/AdminPortalUser";
import { AdminPortalUserSchema } from "../schemas/users/AdminPortalUserSchema";
import { MongooseFactory } from "./MongooseFactory";
import { MongooseRepository } from "./MongooseRepository";

/** Provides access to Mongoose models tied to the BlockSpaces Connect MongoDB instance */
@Injectable()
export class DataContext extends MongooseFactory {
  readonly users: MongooseRepository<AdminPortalUser>;

  constructor() {
    super(mongoose.connection);
    // init models and repositories
    this.users = this.createRepository<AdminPortalUser>("AdminPortalUser", AdminPortalUserSchema);
  }
}
