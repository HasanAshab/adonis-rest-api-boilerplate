import type { NormalizeConstructor } from '@adonisjs/core/helpers'
import { BaseModel } from '@adonisjs/lucid/orm'
import string from '@adonisjs/core/helpers/string'

export default function HasFactory(Superclass: NormalizeConstructor<typeof BaseModel>) {
  return class extends Superclass {
    static factory(options?: object) {
      const factory = new this.factoryClass(this, options)
      factory.configure()
      return factory
    }
  }
}
