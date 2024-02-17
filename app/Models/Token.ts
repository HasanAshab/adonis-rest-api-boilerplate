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
  public oneTime: boolean

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
    const secret = options.secret ?? string.generateRandom(32)
    
    await this.create({
      type,
      key,
      secret
      oneTime: options.oneTimeOnly,
      expiresAt: stringToLuxonDate(options.expiresIn)
    })
    
    return secret
  }
  
  public static get(key: string, type: string) {
    return this.findByFields({ key, type })
  }

  public static async isValid(key: string, type: string, secret: string) {
    const token = await this.get(key, type)
    
    if(token && token.isNotExpired() && await token.compareSecret(secret)) {
      token.oneTime ?? await token.delete()
      return true
    }
    
    return false
  }

  public static async verify(key: string, type: string, secret: string) {
    const isValid = await this.isValid(key, type, secret)
    if (!isValid) {
      throw new InvalidTokenException()
    }
  }
}
