import type { NormalizeConstructor } from '@adonisjs/core/types/helpers'
import { BaseModel } from '@adonisjs/lucid/orm'


export default function HasFactory(Superclass: NormalizeConstructor<typeof BaseModel>) {
  class HasFactoryModel extends Superclass {
    static factory(options?: object) {
      const factory = new this.factoryClass(this, options)
      factory.configure()
      return factory
    }
  }

  return HasFactoryModel
}
