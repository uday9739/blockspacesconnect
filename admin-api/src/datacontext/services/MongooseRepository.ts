import mongoose from "mongoose";

/** Mongoose query that should return at most 1 document */
export type MongooseQuerySingle<TData = any> = mongoose.Query<mongoose.HydratedDocument<TData>, mongoose.HydratedDocument<TData>, {}, TData>;

/** a Mongoose query that can return multiple documents */
export type MongooseQueryMultiple<TData = any> = mongoose.Query<mongoose.HydratedDocument<TData>[], mongoose.HydratedDocument<TData>, {}, TData>;

/**
 * A base class that provides basic CRUD operations for a specific Mongoose model type.
 *
 * * `TData` is the underlying type associated with the Mongoose model/MongoDB document (typically an interface from shared library)
 * * `TId` is the type of the model's `_id` property (defaults to string, which works with Mongo's ObjectId type)
 */
export class MongooseRepository<TData = any, TId = string> {
  /**
   * Create a new {@link MongooseRepository} instance
   *
   * @param model the mongoose model - available mainly for complex queries that aren't handled by the repository methods
   */
  public constructor(readonly model: mongoose.Model<TData>) { }

  /** the name of the underlying MongoDB collection */
  get collectionName(): string {
    return this.model.collection.name;
  }

  /**
   * Creates a new repository using a discriminator, enabling multiple models to utilize the same underlying MongoDB collection.
   *
   * @param name discriminator model name
   * @param schema discriminator model schema
   * @see https://mongoosejs.com/docs/discriminators.html for details
   */
  createDiscriminatorRepository<TData = any, TId = string>(name: string | number, schema?: mongoose.Schema<TData>) {
    const discriminatorModel = this.model.discriminator<TData>(name, schema);
    return new MongooseRepository<TData, TId>(discriminatorModel);
  }

  /**
   * Creates a new document and immediately saves it to the DB
   *
   * @param data the data for the new document
   * @returns the newly added document
   */
  async create(data: TData): Promise<mongoose.HydratedDocument<TData>> {
    return await this.model.create(data);
  }

  /**
   * Returns data for all documents that match the given filter.
   * If no filter is provided, all documents will be returned.
   */
  find(filter?: mongoose.FilterQuery<TData>, projection?: mongoose.ProjectionType<TData>, options?: mongoose.QueryOptions<TData>): MongooseQueryMultiple<TData> {
    return this.model.find(filter, projection, options);
  }

  /**
   * Returns all documents from the underlying collection
   */
  findAll(projection?: mongoose.ProjectionType<TData>, options?: mongoose.QueryOptions<TData>): MongooseQueryMultiple<TData> {
    return this.find(undefined, projection, options);
  }

  /**
   * Finds a single document based on the given ID
   *
   * @returns the document with the matching ID, or null if no document was found
   */
  findById(_id: TId, projection?: mongoose.ProjectionType<TData>, options?: mongoose.QueryOptions<TData>): MongooseQuerySingle<TData> {
    return this.model.findById(_id, projection, options);
  }

  /**
   * Deletes a document with the given `_id` and returns a query that will resolve to the document as it existed prior to deletion.
   *
   * If no document matches the given `_id`, then the query will resolve to null
   */
  findByIdAndDelete(_id: TId, options?: mongoose.QueryOptions<TData>): MongooseQuerySingle<TData> {
    return this.model.findByIdAndDelete(_id, options);
  }

  /**
   * Returns a query that resolves to the first document that matches the given filter,
   * or resolves to null if no match is found
   */
  findOne(filter: mongoose.FilterQuery<TData>, projection?: mongoose.ProjectionType<TData>, options?: mongoose.QueryOptions<TData>): MongooseQuerySingle<TData> {
    return this.model.findOne(filter, projection, options);
  }

  /**
   * Deletes the first document found that matches the given filter.
   * Returns a query that will resolve to the document as it existed prior to deletion.
   *
   * If no document matches the filter, then the query will resolve to null
   */
  findOneAndDelete(filter: mongoose.FilterQuery<TData>, options?: mongoose.QueryOptions<TData>): MongooseQuerySingle<TData> {
    return this.model.findOneAndDelete(filter, options);
  }

  /**
   * Updates the first document found that matches the given filter
   *
   * @returns the updated document or null if no document is found
   */
  findOneAndUpdate(filter: mongoose.FilterQuery<TData>, update?: mongoose.UpdateQuery<TData>, options?: mongoose.QueryOptions<TData>): MongooseQuerySingle<TData> {
    return this.model.findOneAndUpdate(filter, update, options);
  }

  /** Create a new Mongoose document instance using the given data */
  new(data: Partial<TData>): mongoose.HydratedDocument<TData> {
    return new this.model(data);
  }

  /**
   * Finds a document with the given unique ID, applies the updated data, and immediately saves it.
   *
   * The document will be validated prior to updating.
   * If validation fails, a {@link mongoose.Error.ValidationError} will be thrown
   *
   * **Notes:**
   * * to update without first fetching the document, use the model's `update` or `updateOne` methods
   * * to update without validation, use the model's update-related methods directly
   * * for bulk updates, use the model's `updateMany` method
   *
   * @param _id document's _id value
   * @param data the properties to update
   * @returns the updated document, or null if no document was updated
   */
  async updateByIdAndSave(_id: TId, data: Partial<TData>): Promise<mongoose.HydratedDocument<TData>> {
    const docToUpdate = await this.model.findById(_id);
    return await this.updateDocumentAndSave(docToUpdate, data);
  }

  /**
   * Finds the first document matching the given filter, applies the updated data, and immediately saves it.
   *
   * The document will be validated prior to updating.
   * If validation fails, a {@link mongoose.Error.ValidationError} will be thrown
   *
   * @param filter the filter used to find an existing document to update
   * @param data the data to update
   * @returns the updated document or null if no document was found
   */
  async updateOneAndSave(filter: mongoose.FilterQuery<TData>, data: Partial<TData>): Promise<mongoose.HydratedDocument<TData>> {
    const docToUpdate = await this.model.findOne(filter);
    return this.updateDocumentAndSave(docToUpdate, data);
  }

  /** Updates a document with the given data, attempts to save the document, and returns the updated document as a plain JSON object */
  private async updateDocumentAndSave(originalDocument: mongoose.HydratedDocument<TData>, data: Partial<TData>): Promise<mongoose.HydratedDocument<TData>> {
    if (!originalDocument) {
      return null;
    }

    Object.assign(originalDocument, data);
    return (await originalDocument.save()) as mongoose.HydratedDocument<TData>;
  }
}
