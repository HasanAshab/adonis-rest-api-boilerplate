import { BaseModel as Model } from '@adonisjs/lucid/orm'
import is from '@adonisjs/core/helpers/is'
import type { ModelQueryBuilder } from "@adonisjs/lucid/orm";

/**
 * Base model class with common utility methods.
 */
export default class BaseModel extends Model {
  public static where(...args: Parameters<ModelQueryBuilder['where']>) {
    return this.query().where(...args)
  }
  
  public static last() {
    return this.query().last()
  }
  
  /**
   * Find a record by specified fields.
   * @param fields - The fields to search by.
   * @param options - Additional query options.
   * @returns The first matching record.
   */
  public static findByFields(fields: Record<string, any>, options?) {
    return this.query(options).whereEqual(fields).first()
  }
  
  
  public static pluck(column: string) {
    return this.query().pluck(column)
  }

  /**
   * Exclude a row from the query result.
   * @param modelOrId - The model or ID to exclude.
   * @returns A new query builder instance.
   */
  public static except(modelOrId: Model | number) {
    return this.query().except(modelOrId)
  }

  /**
   * Update a record by UID.
   * @param uid - The UID of the record to update.
   * @param data - The data to update.
   * @returns The number of affected rows.
   */
  public static update(uid: number, data: object) {
    return this.query().whereUid(uid).update(data)
  }

  /**
   * Update a record by UID or throw an error if not found.
   * @param uid - The UID of the record to update.
   * @param data - The data to update.
   * @returns The number of affected rows.
   * @throws Error if the record is not found.
   */
  public static updateOrFail(uid: number, data: object) {
    return this.query().whereUid(uid).updateOrFail(data)
  }

  /**
   * Delete a record by UID.
   * @param uid - The UID of the record to delete.
   * @returns The number of affected rows.
   */
  public static delete(uid: number) {
    return this.query().whereUid(uid).delete()
  }

  /**
   * Delete a record by UID or throw an error if not found.
   * @param uid - The UID of the record to delete.
   * @returns The number of affected rows.
   * @throws Error if the record is not found.
   */
  public static deleteOrFail(uid: number) {
    return this.query().whereUid(uid).deleteOrFail()
  }

  
  /**
   * Check if a record exists in the database based on a unique identifier.
   * @param uid - The unique identifier of the record.
   * @returns A boolean indicating whether the record with the specified UID exists.
   */
  public static exists(uid: string | number): Promise<boolean>;
  
  /**
   * Check if a record exists in the database based on a column value.
   * @param column - The name of the column to check.
   * @param value - The value to check for in the specified column.
   * @returns A boolean indicating whether a record with the specified value in the specified column exists.
   */
  public static exists(column: string, value: unknown): Promise<boolean>;
  
  /**
   * Check if a record exists in the database based on provided data.
   * @param data - An object representing the data to check for existence.
   * @returns A boolean indicating whether a record with the specified data exists.
   */
  public static exists(data: object): Promise<boolean>;
  
  /**
   * Implementation of the exists() method.
   */
  public static async exists(uidOrColumnOrData: string | number | object, value?: unknown) {
    return await this.query()
      .when(is.object(uidOrColumnOrData), (query) => {
        query.whereEqual(uidOrColumnOrData)
      })
      .when(!is.object(uidOrColumnOrData) && is.undefined(value), (query) => {
        query.whereUid(uidOrColumnOrData)
      })
      .when(!is.object(uidOrColumnOrData) && !is.undefined(value), (query) => {
        query.where(uidOrColumnOrData, value)
      })
      .exists()
  }

  /**
   * Check if a record does not exist based on various criteria.
   * @param uidOrColumnOrData - ID, field name, or data to check.
   * @param value - The value to check if matching.
   * @returns A boolean indicating whether the record does not exist.
   */
  public static async notExists(...args: Parameters<typeof BaseModel.exists>) {
    return !(await this.exists(...args))
  }

  /**
   * Search for records using a custom search method.
   * @param args - Parameters for the search method.
   * @returns A new query builder instance.
   */
  public static search(...args: Parameters<ModelQueryBuilder['search']>) {
    return this.query().search(...args)
  }

  /**
   * Paginate through records.
   * @param args - Parameters for pagination.
   * @returns A paginated result.
   */
  public static paginate(...args: Parameters<ModelQueryBuilder['paginate']>) {
    return this.query().paginate(...args)
  }

  /**
   * Paginate through records using a custom paginator.
   * @param args - Parameters for pagination using a custom paginator.
   * @returns A paginated result.
   */
  public static paginateUsing(...args: Parameters<ModelQueryBuilder['paginateUsing']>) {
    return this.query().paginateUsing(...args)
  }

  /**
   * Load a relation if it's not already loaded.
   * @param relation - The relation to load.
   */
  public async loadIfNotLoaded(relation: string) {
    if (this[relation] === undefined) {
      await this.load(relation)
    }
  }

  /**
   * Check if the current record still exists in database.
   * @returns A boolean indicating whether the record exists.
   */
  public exists() {
    const uid = this[this.constructor.primaryKey]
    return this.constructor.exists(uid)
  }
}
