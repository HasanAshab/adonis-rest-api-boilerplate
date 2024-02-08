import Database, { ModelQueryBuilder } from '@ioc:Adonis/Lucid/Database'
import type { BaseModel } from '@ioc:Adonis/Lucid/Orm'
import { Exception } from '@poppinss/utils'
import { forIn } from 'lodash'

ModelQueryBuilder.macro('whereEqual', function (fields: Record<string, any>) {
  for (const name in fields) {
    this.where(name, fields[name])
  }
  return this
})

ModelQueryBuilder.macro('whereUid', function (uid: number) {
  return this.where(this.model.primaryKey, uid)
})

ModelQueryBuilder.macro('pluck', async function (column: string) {
  const records = await this.pojo()
  return records.map((record) => record[column])
})

ModelQueryBuilder.macro('find', function (uid: number) {
  return this.whereUid(uid).first()
})

ModelQueryBuilder.macro('findOrFail', function (uid: number) {
  return this.whereUid(uid).firstOrFail()
})

ModelQueryBuilder.macro('updateOrFail', async function (data: object) {
  const count = await this.update(data)
  if (!parseInt(count)) {
    throw new Exception('Row not found', 404, 'E_ROW_NOT_FOUND')
  }
})

ModelQueryBuilder.macro('deleteOrFail', async function () {
  const count = await this.delete()
  if (!parseInt(count)) {
    throw new Exception('Row not found', 404, 'E_ROW_NOT_FOUND')
  }
})

ModelQueryBuilder.macro('exists', async function () {
  return !!(await this.select(1).pojo().first())
})

ModelQueryBuilder.macro('except', function (modelOrId: BaseModel | number) {
  const id = modelOrId instanceof BaseModel ? modelOrId.id : modelOrId
  return this.whereNot('id', id)
})

ModelQueryBuilder.macro('when', function (condition: boolean, cb: QueryBuilderCallback) {
  if (condition) {
    cb(this)
  }
  return this
})

ModelQueryBuilder.macro('getCount', async function (column = '*') {
  const isString = typeof column === 'string'
  const parse = (rawCount: string) => parseInt(BigInt(rawCount))

  if (isString) {
    this.select(Database.raw(`COUNT(${column}) as total`))
  } else {
    forIn(column, (columnName, alias) => {
      this.select(Database.raw(`COUNT(${columnName}) as ${alias}`))
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

ModelQueryBuilder.macro('search', function (query: string, vectorColumn = 'search_vector') {
  this._tsQuery = `plainto_tsquery('${query}')`
  return this.where(vectorColumn, '@@', Database.raw(this._tsQuery))
})

ModelQueryBuilder.macro('rank', function (vectorColumn = 'search_vector') {
  if (!this._tsQuery) {
    throw new Error('Must use search() before using rank()')
  }

  return this.select(Database.raw(`ts_rank_cd(${vectorColumn}, ${this._tsQuery}) AS rank`)).orderBy(
    'rank',
    'DESC'
  )
})

ModelQueryBuilder.macro('paginateUsing', function (request: Request) {
  const page = request.input('page', 1)
  const limit = request.input('limit', 15)
  return this.paginate(page, limit)
})
