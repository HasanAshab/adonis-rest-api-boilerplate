import { BaseModel as Model } from '@ioc:Adonis/Lucid/Orm'
import { types } from '@ioc:Adonis/Core/Helpers';


export default class BaseModel extends Model {
  public async loadIfNotLoaded(relation: string) {
    if(this[relation] === undefined) {
      return await this.load(relation);
    }
  }
  
  public static findByFields(fields: Record<string, any>, options?) {
	  const query = this.query(options);
	  
	  for(const name in fields) {
	    query.where(name, fields[name]);
	  }
	  
	  return query.first();
	}
	
	public static async exists(value: number | object) {
	  return types.isNumber(value)
	    ? !!await this.find(value)
	    : !!await this.findByFields(value)
	}
	
	public static except(modelOrId: Model | number) {
	  return this.query().except(modelOrId);
	}
}