import { BaseModel as Model } from '@ioc:Adonis/Lucid/Orm'
import { types } from '@ioc:Adonis/Core/Helpers'

export default class BaseModel extends Model {
  public static findByFields(fields: Record<string, any>, options?) {
    const query = this.query(options)

    for (const name in fields) {
      query.where(name, fields[name])
    }

    return query.first()
  }

  public static except(modelOrId: Model | number) {
    return this.query().except(modelOrId)
  }

  public static update(uid: number, data: object) {
    return this.query().find(uid).update(data)
  }

  public static updateOrFail(uid: number, data: object) {
    return this.query().find(uid).updateOrFail(data)
  }

  public static delete(uid: number) {
    return this.query().find(uid).delete()
  }

  public static deleteOrFail(uid: number) {
    return this.query().find(uid).deleteOrFail()
  }

  public static async exists<T extends number | string | object>(
    idOrFieldOrData: T,
    value: T extends string ? unknown : never
  ) {
    if (types.isNumber(idOrFieldOrData)) {
      return !!(await this.find(value))
    }

    if (types.isString(idOrFieldOrData)) {
      return await this.query().where(idOrFieldOrData, value).exists()
    }

    return !!(await this.findByFields(idOrFieldOrData))
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

  public async exists() {
    const uid = this[this.constructor.primaryKey]
    return !!(await this.constructor.find(uid))
  }
}
