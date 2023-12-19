import { Schema, Model, Document } from "mongoose";


/**
 * Plugin to add base helpers
 */
export default function Helpers(schema: Schema) {
  schema.statics.where = function(field: string) {
    const equals = value => {
      return this.find({ [field]: value });
    }
    
    return { equals };
  }

  schema.statics.updateOneById = async function(id: string, data: object) {
    const { modifiedCount } = await this.constructor.updateOne({ _id: id }, data);
    return modifiedCount === 1;
  }
  
  schema.statics.deleteOneById = async function(id: string) {
    const { deletedCount } = await this.constructor.deleteOne({ _id: id });
    return deletedCount === 1;
  }
  
  schema.methods.delete = async function() {
    await this.constructor.deleteOneById(this._id);
  }
  
  schema.methods.update = async function(data: object, overwrite = true) {
    const document = await this.constructor.findByIdAndUpdateOrFail(this._id, data, { new: true });
    overwrite && this.overwrite(document._doc);
    return document;
  }
  
  schema.methods.refresh = async function(this: Document) {
    const latestData = await this.constructor.findByIdOrFail(this._id);
    return this.overwrite(latestData._doc);
  }
  
  schema.virtual("exists").get(async function() {
    return await this.constructor.exists({ _id: this._id });
  });

  schema.query.when = function(condition: boolean, queryBuilder) {
    if(condition) {
      queryBuilder(this);
    }
    return this;
  }
}