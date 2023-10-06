/**
 * A base interface for suitable for most data models that will be persisted as MongoDB documents.
 * Includes the "_id" property that MongoDB creates by default.
 *
 * `TId` represents the type of `_id` (defaults to string)
 */
export interface MongoDbModel<TId = string> {
  /** unique ID for this model (typically represented as an ObjectId in Mongo) */
  readonly _id?: TId;
}

/**
 * A base interface for data models that will be stored as MongoDB documents and should support optimistic concurrency checking.
 *
 * This interface extends the base {@link MongoDbModel} and adds the "__v" property, which tracks the "version" of the document.
 * The `__v` property is something that will be automatically modified within the data access layer, and should never be modified
 * manually, in either the frontend or backend.
 */
export interface VersionedMongoDbModel extends MongoDbModel {
  readonly __v?: number;
}