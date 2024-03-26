import { BaseModel as Model } from '@adonisjs/lucid/orm'
import is from '@adonisjs/core/helpers/is'
import { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import { ExtractModelRelations } from '@adonisjs/lucid/types/relations'



type QueryBuilder = ModelQueryBuilderContract<typeof BaseModel, BaseModel>

/**
 * Base model class with common utility methods.
 */
export default class BaseModel extends Model {
  static where(...args: Parameters<QueryBuilder['where']>) {
    return this.query().where(...args)
  }

  static last() {
    return this.query().last()
  }

  /**
   * Find a record by specified fields.
   * @param fields - The fields to search by.
   * @param options - Additional query options.
   * @returns The first matching record.
   */
  static findByFields(fields: Record<string, any>) {
    return this.query().whereEqual(fields).first()
  }

  static pluck(column: string) {
    return this.query().pluck(column)
  }

  /**
   * Exclude a row from the query result.
   * @param modelOrId - The model or ID to exclude.
   * @returns A new query builder instance.
   */
  static except(modelOrId: InstanceType<typeof Model> | number) {
    return this.query().except(modelOrId)
  }

  /**
   * Update a record by UID.
   * @param uid - The UID of the record to update.
   * @param data - The data to update.
   * @returns The number of affected rows.
   */
  static update(uid: number, data: object) {
    return this.query().whereUid(uid).update(data)
  }

  /**
   * Update a record by UID or throw an error if not found.
   * @param uid - The UID of the record to update.
   * @param data - The data to update.
   * @returns The number of affected rows.
   * @throws Error if the record is not found.
   */
  static updateOrFail(uid: number, data: object) {
    return this.query().whereUid(uid).updateOrFail(data)
  }

  /**
   * Delete a record by UID.
   * @param uid - The UID of the record to delete.
   * @returns The number of affected rows.
   */
  static delete(uid: number) {
    return this.query().whereUid(uid).delete()
  }

  /**
   * Delete a record by UID or throw an error if not found.
   * @param uid - The UID of the record to delete.
   * @returns The number of affected rows.
   * @throws Error if the record is not found.
   */
  static deleteOrFail(uid: number) {
    return this.query().whereUid(uid).deleteOrFail()
  }

  /**
   * Check if a record exists in the database based on a unique identifier.
   * @param uid - The unique identifier of the record.
   * @returns A boolean indicating whether the record with the specified UID exists.
   */
  static exists(uid: string | number): Promise<boolean>

  /**
   * Check if a record exists in the database based on a column value.
   * @param column - The name of the column to check.
   * @param value - The value to check for in the specified column.
   * @returns A boolean indicating whether a record with the specified value in the specified column exists.
   */
  static exists(column: string, value: unknown): Promise<boolean>

  /**
   * Check if a record exists in the database based on provided data.
   * @param data - An object representing the data to check for existence.
   * @returns A boolean indicating whether a record with the specified data exists.
   */
  static exists(data: object): Promise<boolean>

  /**
   * Implementation of the exists() method.
   */
  static exists(uidOrColumnOrData: string | number | object, value?: string | number | boolean) {
    const query = this.query()
    if (is.object(uidOrColumnOrData)) {
      query.whereEqual(uidOrColumnOrData)
    } 
    else if(is.string(uidOrColumnOrData) && !is.undefined(value)) {
      query.where(uidOrColumnOrData, value)
    }
    else if (is.number(uidOrColumnOrData)) {
      query.whereUid(uidOrColumnOrData)
    }
    return query.exists()
  }

  /**
   * Check if a record does not exist based on various criteria.
   * @param uidOrColumnOrData - ID, field name, or data to check.
   * @param value - The value to check if matching.
   * @returns A boolean indicating whether the record does not exist.
   */
  static async notExists(...args: Parameters<typeof BaseModel.exists>) {
    return !(await this.exists(...args))
  }

  /**
   * Search for records using a custom search method.
   * @param args - Parameters for the search method.
   * @returns A new query builder instance.
   */
  static search(...args: Parameters<QueryBuilder['search']>) {
    return this.query().search(...args)
  }

  /**
   * Paginate through records.
   * @param args - Parameters for pagination.
   * @returns A paginated result.
   */
  static paginate(...args: Parameters<QueryBuilder['paginate']>) {
    return this.query().paginate(...args)
  }

  /**
   * Paginate through records using a custom paginator.
   * @param args - Parameters for pagination using a custom paginator.
   * @returns A paginated result.
   */
  static paginateUsing(...args: Parameters<QueryBuilder['paginateUsing']>) {
    return this.query().paginateUsing(...args)
  }

  /**
   * Load a relation if it's not already loaded.
   * @param relation - The relation to load.
   */
  async loadIfNotLoaded(relation: ExtractModelRelations<this>) {
    if (this[relation] === undefined) {
      await this.load(relation)
    }
  }

  /**
   * Check if the record currently exists in database.
   * @returns A boolean indicating whether the record exists.
   */
  exists() {
    const model = this.constructor as typeof BaseModel
    const uid = this[model.primaryKey as keyof this] as string | number
    return model.exists(uid)
  }
}
