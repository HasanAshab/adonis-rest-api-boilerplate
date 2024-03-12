import { column, beforeSave } from '@adonisjs/lucid/orm'
import BaseModel from '#models/base_model'
import { DateTime } from 'luxon'
import { compose } from '@adonisjs/core/helpers'
import { stringToLuxonDate } from '#app/helpers'
import hash from '@adonisjs/core/services/hash'
import Expirable from '#models/traits/expirable'
import InvalidTokenException from '#exceptions/invalid_token_exception'
import string from "@adonisjs/core/helpers/string";

export interface SignTokenOptions {
  secret?: string | number
  expiresIn?: string
  oneTimeOnly?: boolean
  secretLength?: number
}


export default class Token extends compose(BaseModel, Expirable) {
  @column({ isPrimary: true })
  declare id: number
  
  @column()
  declare type: string

  @column()
  declare oneTime: boolean
  
  @column()
  declare key: string

  @column()
  declare secret: string

  public compareSecret(secret: string) {
    return hash.verify(this.secret, secret)
  }

  @beforeSave()
  public static async hashSecretIfModified(token: Token) {
    if (token.$dirty.secret) {
      token.secret = await hash.make(token.secret)
    }
  }
  
  public static async sign(type: string, key: string, options: SignTokenOptions = {}): string {
    const secret = options.secret ?? string.generateRandom(options.secretLength ?? 64)

    await this.create({
      type,
      key,
      secret,
      oneTime: options.oneTimeOnly ?? false,
      expiresAt: options.expiresIn && stringToLuxonDate(options.expiresIn)
    })
    
    return secret
  }
  
  public static async isValid(type: string, key: string, secret: string) {
    const token = await this.findByFields({ type, key })

    if(token && token.isNotExpired() && await token.compareSecret(secret)) {
      token.oneTime && await token.delete()
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
