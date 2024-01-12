import type { NormalizeConstructor } from '@ioc:Adonis/Core/Helpers'
import { BaseModel } from '@ioc:Adonis/Lucid/Orm'

export default function HasFactory(Superclass: NormalizeConstructor<typeof BaseModel>) {
  return class HasFactoryModel extends Superclass {
    static get factoryClass() {
      if(!this._factoryClass) {
        this._factoryClass = require(`Database/factories/${this.name}Factory`).default;
      }
      return this._factoryClass;
    }
    
    static factory(options?: object) {
  		const factory = new this.factoryClass(this, options);
  		factory.configure();
  		return factory;
  	}
  }
}
