export default function HasFactory(Superclass) {
  return class HasFactoryModel extends Superclass {
    static get factoryClass() {
      if(!this._factoryClass) {
        this._factoryClass = require(`Database/factories/${this.name}Factory`).default;
      }
      return this._factoryClass;
    }
    
    static factory(options?: object) {
  		const factory = new this.factoryClass(this, options);
  		factory.configure?.();
  		return factory;
  	}
  /*	
  	static bootIfNotBooted () {
      if (this.name !== 'HasFactoryModel') {
        super.bootIfNotBooted()
      }
    }*/
  }
}
