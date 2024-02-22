import { column, beforeSave } from '@ioc:Adonis/Lucid/Orm'
import BaseModel from 'App/Models/BaseModel'
import { DateTime } from 'luxon'
import { compose } from '@poppinss/utils/build/helpers'
import { string } from '@ioc:Adonis/Core/Helpers'
import { stringToLuxonDate } from 'App/helpers'
import Hash from '@ioc:Adonis/Core/Hash'
import Expirable from 'App/Models/Traits/Expirable'
import InvalidTokenException from 'App/Exceptions/InvalidTokenException'


export interface SignTokenOptions {
  secret?: string | number
  expiresIn?: string
  oneTimeOnly?: boolean
}


export default class Token extends compose(BaseModel, Expirable) {
  @column({ isPrimary: true })
  public id: number

  @column()
  public key: string

  @column()
  public type: string

  @column()
  public oneTime = true

  @column()
  public secret: string

  public compareSecret(secret: string) {
    return Hash.verify(this.secret, secret)
  }

  @beforeSave()
  public static async hashSecretIfModified(token: Token) {
    if (token.$dirty.secret) {
      token.secret = await Hash.make(token.secret)
    }
  }
  
  public static async sign(type: string, key: string, options: SignTokenOptions): string {
    const secret = options.secret ?? string.generateRandom(64)
    
    await this.create({
      type,
      key,
      secret,
      oneTime: options.oneTimeOnly,
      expiresAt: options.expiresIn && stringToLuxonDate(options.expiresIn)
    })
    
    return secret
  }
  

  public static async isValid(type: string, key: string, secret: string) {
    const token = await this.findByFields({ type, key })
    
    if(token && token.isNotExpired() && await token.compareSecret(secret)) {
      token.oneTime ?? await token.delete()
      return true
    }
    
    return false
  }

  public static async verify(type: string, key: string, secret: string) {
    const isValid = await this.isValid(type, key, secret)
    if (!isValid) {
      throw new InvalidTokenException()
    }
  }
}
