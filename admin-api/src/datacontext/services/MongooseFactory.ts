import mongoose from "mongoose";
import { MongooseRepository } from "./MongooseRepository";

/**
 * Provides centralized access to Mongoose models that are all tied to the same MongoDB instance (server, replica set, etc)
 */
export abstract class MongooseFactory {
  /**
   * Create a new data context
   * @param connection the Mongoose connection that the models will be associated with
   */
  protected constructor(protected readonly connection: mongoose.Connection) {}

  /**
   * Creates a new repository instance that wraps a Mongoose model
   *
   * @param modelName the name of the underlying Mongoose model
   * @param schema the schema used for validating the data
   * @param collectionName optional name to use for the MongoDB collection; if not specified, collection name will be inferred from model name
   */
  protected createRepository<TData = any, TId = string>(
    modelName: string,
    schema?: mongoose.Schema<TData>,
    collectionName?: string
  ): MongooseRepository<TData, TId> {
    return new MongooseRepository<TData, TId>(this.connection.model<TData>(modelName, schema, collectionName));
  }

  /**
   * Deprecated. Use createRepository
   *
   * @param name the name of the model
   * @param schema the schema used for validating the model
   * @param collection if specified, the name of the Mongo collection; otherwise, collection name will be inferred from name
   * @returns a new Mongoose model
   * @deprecated
   */
  protected createModel<T>(name: string, schema?: mongoose.Schema<T>, collection?: string): mongoose.Model<T> {
    return this.connection.model<T>(name, schema, collection);
  }
}