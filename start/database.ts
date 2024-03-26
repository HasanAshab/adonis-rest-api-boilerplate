import db from '@adonisjs/lucid/services/db'
import { BaseModel } from '@adonisjs/lucid/orm'
import { forIn } from 'lodash-es'
import { DatabaseQueryBuilder } from '@adonisjs/lucid/database'
import { ModelQueryBuilder } from '@adonisjs/lucid/orm'
import type { Request } from '@adonisjs/core/http'
import { errors } from '@adonisjs/lucid'

/**
 * Macro to check if any records match the query.
 */
DatabaseQueryBuilder.macro('exists', async function (this: DatabaseQueryBuilder) {
  return !!(await this.select(1).first())
})

/**
 * Macro to add WHERE clauses for multiple fields with their respective values.
 * @param fields - The fields and their values to filter by.
 */
ModelQueryBuilder.macro(
  'whereEqual',
  function (this: ModelQueryBuilder<any, any>, fields: Record<string, any>) {
    for (const name in fields) {
      this.where(name, fields[name])
    }
    return this
  }
)

/**
 * Macro to add a WHERE clause for the primary key of the model.
 * @param uid - The value of the primary key.
 */
ModelQueryBuilder.macro('whereUid', function (this: ModelQueryBuilder<any, any>, uid: number) {
  return this.where(this.model.primaryKey, uid)
})

/**
 * Macro to pluck a single column value from the resulting rows.
 * @param column - The name of the column to pluck.
 */
ModelQueryBuilder.macro('pluck', async function (this: ModelQueryBuilder<any, any>, column: string) {
  const records = await this.select(column).pojo().exec()
  return records.map((record: Record<string, any>) => record[column])
})

ModelQueryBuilder.macro('last', function (this: ModelQueryBuilder<any, any>) {
  return this.orderBy('created_at', 'desc').first()
})

/**
 * Macro to find a record by its primary key.
 * @param uid - The value of the primary key.
 */
ModelQueryBuilder.macro('find', function (this: ModelQueryBuilder<any, any>, uid: number) {
  return this.whereUid(uid).first()
})

/**
 * Macro to find a record by its primary key or throw an exception if not found.
 * @param uid - The value of the primary key.
 */
ModelQueryBuilder.macro('findOrFail', function (this: ModelQueryBuilder<any, any>, uid: number) {
  return this.whereUid(uid).firstOrFail()
})

/**
 * Macro to update records based on a query or throw an exception if no rows are affected.
 * @param data - The data to update.
 */
ModelQueryBuilder.macro('updateOrFail', async function (this: ModelQueryBuilder<any, any>, data: object) {
  const count = await this.update(data)
  if (!Number.parseInt(count.toString())) {
    throw new errors.E_ROW_NOT_FOUND()
  }
})

/**
 * Macro to delete records based on a query or throw an exception if no rows are affected.
 */
ModelQueryBuilder.macro('deleteOrFail', async function (this: ModelQueryBuilder<any, any>) {
  const count = await this.delete()
  if (!Number.parseInt(count)) {
    throw new errors.E_ROW_NOT_FOUND()
  }
})

/**
 * Macro to check if any records match the query.
 */
ModelQueryBuilder.macro('exists', async function (this: ModelQueryBuilder<any, any>) {
  return !!(await this.select(1).pojo().first())
})

/**
 * Macro to exclude a specific model instance or ID from the query results.
 * @param modelOrId - The model instance or ID to exclude.
 */
ModelQueryBuilder.macro(
  'except',
  function (this: ModelQueryBuilder<any, any>, modelOrUid: InstanceType<typeof BaseModel> | number | string) {
    const uid =
      modelOrUid instanceof BaseModel ? (modelOrUid as any)[this.model.primaryKey] : modelOrUid
    return this.whereNot(this.model.primaryKey, uid)
  }
)

/**
 * Macro to count the number of records matching the query.
 * @param column - The column or columns to count.
 */
ModelQueryBuilder.macro(
  'getCount',
  async function <T extends string | object>(this: ModelQueryBuilder<any, any>, column: T = '*'): Promise<T extends string ? number : Record<string, number>> {
    const isString = typeof column === 'string'

    if (isString) {
      this.select(db.raw(`COUNT(${column}) as total`))
    } else {
      forIn(column, (columnName, alias) => {
        this.select(db.raw(`COUNT(${columnName}) as ${alias}`))
      })
    }

    const data = await this.pojo().first()

    if (isString) {
      return Number.parseInt(data.total)
    }

    const result: Record<string, number> = {}
    forIn(column, (_, alias) => {
      result[alias] = Number.parseInt(data[alias.toLowerCase()])
    })

    return result
  }
)

/**
 * Macro to perform a full-text search using PostgreSQL's built-in text search functionality.
 * @param query - The search query.
 * @param vectorColumn - The name of the column containing the search vector.
 */
ModelQueryBuilder.macro(
  'search',
  function (this: ModelQueryBuilder<any, any>, query: string, vectorColumn = 'search_vector') {
    this._tsQuery = `plainto_tsquery('${query}')`
    return this.where(vectorColumn, '@@', db.raw(this._tsQuery))
  }
)

/**
 * Macro to calculate the rank of search results based on their relevance to the search query.
 * @param vectorColumn - The name of the column containing the search vector.
 */
ModelQueryBuilder.macro('rank', function (this: ModelQueryBuilder<any, any>, vectorColumn = 'search_vector') {
  if (!this._tsQuery) {
    throw new Error('Must use search() before using rank()')
  }

  return this.select(db.raw(`ts_rank_cd(${vectorColumn}, ${this._tsQuery}) AS rank`)).orderBy(
    'rank',
    'DESC'
  )
})

/**
 * Macro to paginate query results using request parameters.
 * @param request - The HTTP request object containing pagination parameters.
 */
ModelQueryBuilder.macro('paginateUsing', function (this: ModelQueryBuilder<any, any>, request: Request) {
  const page = request.input('page', 1)
  const limit = request.input('limit', 15)
  return this.paginate(page, limit)
})
