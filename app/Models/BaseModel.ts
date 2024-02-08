import { BaseModel as Model, ModelQueryBuilderContract } from '@ioc:Adonis/Lucid/Orm'
import { types } from '@ioc:Adonis/Core/Helpers'
import Database from '@ioc:Adonis/Lucid/Database'

/**
 * Base model class with common utility methods.
 */
export default class BaseModel extends Model {
  /**
   * Find a record by specified fields.
   * @param fields - The fields to search by.
   * @param options - Additional query options.
   * @returns The first matching record.
   */
  public static findByFields(fields: Record<string, any>, options?) {
    return this.query(options).whereEqual(fields).first()
  }

  /**
   * Exclude a model or ID from the query result.
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
   * Check if a record exists based on various criteria.
   * @param idOrFieldOrData - ID, field name, or data to check.
   * @param value - The value to check if matching.
   * @returns A boolean indicating whether the record exists.
   */
  public static exists<T extends number | string | object>(
    idOrFieldOrData: T,
    value: T extends string ? unknown : never
  ) {
    return this.query()
      .when(types.isNumber(idOrFieldOrData), (query) => {
        query.whereUid(idOrFieldOrData)
      })
      .when(types.isString(idOrFieldOrData), (query) => {
        query.where(idOrFieldOrData, value)
      })
      .when(types.isObject(idOrFieldOrData), (query) => {
        query.whereEqual(idOrFieldOrData)
      })
      .exists()
  }

  /**
   * Check if a record does not exist based on various criteria.
   * @param idOrFieldOrData - ID, field name, or data to check.
   * @param value - The value to check if matching.
   * @returns A boolean indicating whether the record does not exist.
   */
  public static async notExists<T extends number | string | object>(
    idOrFieldOrData: T,
    value: T extends string ? unknown : never
  ) {
    return !(await this.exists(idOrFieldOrData, value))
  }

  /**
   * Search for records using a custom search method.
   * @param args - Parameters for the search method.
   * @returns A new query builder instance.
   */
  public static search(...args: Parameters<ModelQueryBuilderContract['search']>) {
    return this.query().search(...args)
  }

  /**
   * Paginate through records.
   * @param args - Parameters for pagination.
   * @returns A paginated result.
   */
  public static paginate(...args: Parameters<ModelQueryBuilderContract['paginate']>) {
    return this.query().paginate(...args)
  }

  /**
   * Paginate through records using a custom paginator.
   * @param args - Parameters for pagination using a custom paginator.
   * @returns A paginated result.
   */
  public static paginateUsing(...args: Parameters<ModelQueryBuilderContract['paginateUsing']>) {
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
