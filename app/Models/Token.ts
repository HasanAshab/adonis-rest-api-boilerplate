import { column, beforeCreate } from '@ioc:Adonis/Lucid/Orm'
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
	
	@column.json()
	public data: object | null;
	
	@column()
	public secret: string;

  @column.dateTime()
	public expiresAt: DateTime | null;
	
	public static generateSecret(bytes = 32) {
	  return crypto.randomBytes(bytes).toString('hex');
	}
	
	@beforeCreate()
	public static setSecretIfNotProvided(token: Token) {
	  if(!token.secret) {
	    token.secret = this.generateSecret();
	  }
	}
	
	public static async isValid(key: string, type: string, secret: string) {
    const token = await this.findByFields({ key, type, secret }).first();
    if (!token) return false;
    await token.delete();
    return !token.expiresAt || (token.expiresAt && token.expiresAt > DateTime.local());
	}
	
	public static async verify<T extends object | null = null>(key: string, type: string, secret: string): Promise<T> {
    const token = await this.findOneAndDelete({ key, type, secret });
    if(!token) {
      throw new InvalidTokenException();
    }
    return token.data as T;
	}
}

