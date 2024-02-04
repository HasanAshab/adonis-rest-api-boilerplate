import { BaseModel as Model } from '@ioc:Adonis/Lucid/Orm'
import { types } from '@ioc:Adonis/Core/Helpers'
import Database from '@ioc:Adonis/Lucid/Database'

export default class BaseModel extends Model {
  public static findByFields(fields: Record<string, any>, options?) {
    return this.query(options).whereEqual(fields).first()
  }

  public static except(modelOrId: Model | number) {
    return this.query().except(modelOrId)
  }

  public static update(uid: number, data: object) {
    return this.query().whereUid(uid).update(data)
  }

  public static updateOrFail(uid: number, data: object) {
    return this.query().whereUid(uid).updateOrFail(data)
  }

  public static delete(uid: number) {
    return this.query().whereUid(uid).delete()
  }

  public static deleteOrFail(uid: number) {
    return this.query().whereUid(uid).deleteOrFail()
  }

  public static exists<T extends number | string | object>(
    idOrFieldOrData: T,
    value: T extends string ? unknown : never
  ) {
    return this.query()
    .when(types.isNumber(idOrFieldOrData), query => {
      query.whereUid(idOrFieldOrData)
    })
    .when(types.isString(idOrFieldOrData), query => {
      query.where(idOrFieldOrData, value)
    }) 
    .when(types.isObject(idOrFieldOrData), query => {
      query.whereEqual(idOrFieldOrData)
    })
    .exists()
  }

  public static async notExists<T extends number | string | object>(
    idOrFieldOrData: T,
    value: T extends string ? unknown : never
  ) {
    return !(await this.exists(idOrFieldOrData, value))
  }

  public async loadIfNotLoaded(relation: string) {
    if (this[relation] === undefined) {
      await this.load(relation)
    }
  }

  public exists() {
    const uid = this[this.constructor.primaryKey]
    return this.constructor.exists(uid)
  }
}
