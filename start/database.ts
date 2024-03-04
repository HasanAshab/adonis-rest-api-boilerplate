import db from '@adonisjs/lucid/services/db'
import type { BaseModel } from '@adonisjs/lucid/orm'
import { Exception } from "@adonisjs/core/exceptions";
import { forIn } from 'lodash-es'
import { DatabaseQueryBuilder } from "@adonisjs/lucid/database";

/**
 * Macro to check if any records match the query.
 */
DatabaseQueryBuilder.macro('exists', async function () {
  return !!(await this.select(1).first())
})


/**
 * Macro to add WHERE clauses for multiple fields with their respective values.
 * @param fields - The fields and their values to filter by.
 */
ModelQueryBuilder.macro('whereEqual', function (fields: Record<string, any>) {
  for (const name in fields) {
    this.where(name, fields[name])
  }
  return this
})

/**
 * Macro to add a WHERE clause for the primary key of the model.
 * @param uid - The value of the primary key.
 */
ModelQueryBuilder.macro('whereUid', function (uid: number) {
  return this.where(this.model.primaryKey, uid)
})

/**
 * Macro to pluck a single column value from the resulting rows.
 * @param column - The name of the column to pluck.
 */
ModelQueryBuilder.macro('pluck', async function (column: string) {
  const records = await this.select(column).pojo()
  return records.map((record) => record[column])
})


ModelQueryBuilder.macro('last', function () {
  return this.orderBy('created_at', 'desc').first()
})


/**
 * Macro to find a record by its primary key.
 * @param uid - The value of the primary key.
 */
ModelQueryBuilder.macro('find', function (uid: number) {
  return this.whereUid(uid).first()
})

/**
 * Macro to find a record by its primary key or throw an exception if not found.
 * @param uid - The value of the primary key.
 */
ModelQueryBuilder.macro('findOrFail', function (uid: number) {
  return this.whereUid(uid).firstOrFail()
})

/**
 * Macro to update records based on a query or throw an exception if no rows are affected.
 * @param data - The data to update.
 */
ModelQueryBuilder.macro('updateOrFail', async function (data: object) {
  const count = await this.update(data)
  if (!parseInt(count)) {
    throw new Exception('Row not found', 404, 'E_ROW_NOT_FOUND')
  }
})

/**
 * Macro to delete records based on a query or throw an exception if no rows are affected.
 */
ModelQueryBuilder.macro('deleteOrFail', async function () {
  const count = await this.delete()
  if (!parseInt(count)) {
    throw new Exception('Row not found', 404, 'E_ROW_NOT_FOUND')
  }
})


/**
 * Macro to check if any records match the query.
 */
ModelQueryBuilder.macro('exists', async function () {
  return !!(await this.select(1).pojo().first())
})

/**
 * Macro to exclude a specific model instance or ID from the query results.
 * @param modelOrId - The model instance or ID to exclude.
 */
ModelQueryBuilder.macro('except', function (modelOrId: BaseModel | number) {
  const id = modelOrId instanceof BaseModel ? modelOrId.id : modelOrId
  return this.whereNot('id', id)
})

/**
 * Macro to conditionally apply a query scope based on a boolean condition.
 * @param condition - The boolean condition determining whether to apply the query scope.
 * @param cb - The callback function defining the query scope.
 */
ModelQueryBuilder.macro('when', function (condition: boolean, cb: QueryBuilderCallback) {
  if (condition) {
    cb(this)
  }
  return this
})

/**
 * Macro to count the number of records matching the query.
 * @param column - The column or columns to count.
 */
ModelQueryBuilder.macro('getCount', async function (column = '*') {
  const isString = typeof column === 'string'
  const parse = (rawCount: string) => parseInt(BigInt(rawCount))

  if (isString) {
    this.select(db.raw(`COUNT(${column}) as total`))
  } else {
    forIn(column, (columnName, alias) => {
      this.select(db.raw(`COUNT(${columnName}) as ${alias}`))
    })
  }

  const result = await this.pojo().first()

  if (isString) {
    return parse(result.total)
  }

  forIn(column, (columnName, alias) => {
    result[alias] = parse(result[alias.toLowerCase()])
  })

  return result
})

/**
 * Macro to perform a full-text search using PostgreSQL's built-in text search functionality.
 * @param query - The search query.
 * @param vectorColumn - The name of the column containing the search vector.
 */
ModelQueryBuilder.macro('search', function (query: string, vectorColumn = 'search_vector') {
  this._tsQuery = `plainto_tsquery('${query}')`
  return this.where(vectorColumn, '@@', db.raw(this._tsQuery))
})

/**
 * Macro to calculate the rank of search results based on their relevance to the search query.
 * @param vectorColumn - The name of the column containing the search vector.
 */
ModelQueryBuilder.macro('rank', function (vectorColumn = 'search_vector') {
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
ModelQueryBuilder.macro('paginateUsing', function (request: Request) {
  const page = request.input('page', 1)
  const limit = request.input('limit', 15)
  return this.paginate(page, limit)
})
