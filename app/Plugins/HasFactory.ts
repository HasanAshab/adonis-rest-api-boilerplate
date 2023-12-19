import { Schema, Document } from "mongoose";

export interface HasFactoryModel {
  factory(options?: Record<string, any>): any;
}


export default (schema: Schema) => {
  let Factory: any;
  
  function importFactoryOnce(modelName: string) {
    if(!Factory)
      Factory = require(`~/database/factories/${modelName}Factory`).default;
  }
  
  schema.statics.factory = function(options?: object) {
    importFactoryOnce(this.modelName)
    const factory = new Factory(this, options);
    factory.configure?.();
    return factory;
  }
}