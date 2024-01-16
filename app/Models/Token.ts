import { column, beforeCreate, afterFind } from '@ioc:Adonis/Lucid/Orm'
import BaseModel from "App/Models/BaseModel";
import { DateTime } from 'luxon'
import crypto from "crypto";
import InvalidTokenException from "App/Exceptions/InvalidTokenException";


export default class Token extends BaseModel {
  @column({ isPrimary: true })
	public id: number;
  
  @column()
  public key: string;
  
  @column()
	public type: string;
	
	@column()
	public oneTime = false;
	
	@column.json()
	public data: object | null = null;
	
	@column()
	public secret: string;	
	

  @column.dateTime()
	public expiresAt: DateTime | null;
	
	public isExpired() {
	  return this.expiresAt && this.expiresAt < DateTime.local();
	}

	public isNotExpired() {
	  return !this.isExpired();
	}
	
	public static generateSecret(bytes = 32) {
	  return crypto.randomBytes(bytes).toString('hex');
	}
	
	@beforeCreate()
	public static setSecretIfNotProvided(token: Token) {
	  if(!token.secret) {
	    token.secret = this.generateSecret();
	  }
	}
	
  @afterFind()
  public static deleteOneTimeTokens(token: Token) {
    if(token.oneTime) {
      return token.delete();
    }
  }
	
	public static async isValid(key: string, type: string, secret: string) {
    const token = await this.findByFields({ key, type, secret });
    if (!token) return false;
    return token.isNotExpired();
	}
	
	public static async verify<T extends object | null = null>(key: string, type: string, secret: string): Promise<T> {
    const token = await this.findByFields({ key, type, secret });

    if(!token || token?.isExpired()) {
      throw new InvalidTokenException();
    }
    
    return token.data as T;
	}
}