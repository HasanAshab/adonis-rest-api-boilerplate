import { column, beforeCreate, afterFind } from '@ioc:Adonis/Lucid/Orm'
import BaseModel from "App/Models/BaseModel";
import { DateTime } from 'luxon'
import { compose } from '@poppinss/utils/build/helpers'
import { string } from '@ioc:Adonis/Core/Helpers'
import Expirable from 'App/Models/Traits/Expirable'
import InvalidTokenException from "App/Exceptions/InvalidTokenException";


export default class Token extends compose(BaseModel, Expirable) {
  @column({ isPrimary: true })
	public id: number;
  
  @column()
  public key: string;
  
  @column()
	public type: string;
	
	@column()
	public oneTime = false;
	
	@column()
	public data: object | null = null;
	
	@column()
	public secret: string;
	

	@beforeCreate()
	public static setSecretIfNotSetted(token: Token) {
	  if(!token.secret) {
	    token.secret = string.generateRandom(32);
	  }
	}
	
  @afterFind()
  public static deleteIfOneTimeToken(token: Token) {
    if(token.oneTime) {
      return token.delete();
    }
  }
	
	public static async isValid(key: string, type: string, secret: string) {
    const token = await this.findByFields({ key, type, secret });
    return !!token?.isNotExpired();
	}
	
	public static async verify<T extends object | null = null>(key: string, type: string, secret: string): Promise<T> {
    const token = await this.findByFields({ key, type, secret });
    if(!token || token?.isExpired()) {
      throw new InvalidTokenException();
    }
    
    return token.data as T;
	}
}