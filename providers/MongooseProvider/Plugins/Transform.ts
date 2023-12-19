import { Schema, Model, Document } from "mongoose";

/**
 * The global transformer
 */
function transformDocument() {
  this.id = this._id?.toHexString();
  delete this._id;
  delete this.__v;
  return this;
}


/**
 * Plugin to transform lean documents
 */
export default function Transform(schema: Schema) {
  schema.post(/find/, function(result) {
    if(!result || !this._mongooseOptions.lean) return;
    if(Array.isArray(result))
      result.forEach(doc => doc.toJSON = transformDocument);
    else result.toJSON = transformDocument;
  });
  
  schema.set('toJSON', {
    transform: (doc, ret) => transformDocument.apply(ret)
  });
}