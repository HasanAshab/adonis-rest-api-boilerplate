import type { NormalizeConstructor } from '@adonisjs/core/helpers'
import { BaseModel } from '@adonisjs/lucid/orm'
import string from '@adonisjs/core/helpers/string'

export default function HasFactory(Superclass: NormalizeConstructor<typeof BaseModel>) {
  return class extends Superclass {
    static get factoryClass() {
      if (!this._factoryClass) {
        this._factoryClass = require(`Database/factories/${string.toSnakeCase(this.name)}_factory`).default
      }
      return this._factoryClass
    }

    static factory(options?: object) {
      const factory = new this.factoryClass(this, options)
      factory.configure()
      return factory
    }
  }
}
