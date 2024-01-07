import { BaseModel as Model } from '@ioc:Adonis/Lucid/Orm'
import { types } from '@ioc:Adonis/Core/Helpers';


export default class BaseModel extends Model {
  public static findByFields(fields: Record<string, any>, options?) {
	  const query = this.query(options);
	  
	  for(const name in fields) {
	    query.where(name, fields[name]);
	  }
	  
	  return query;
	}
}