import BaseModel from 'App/Models/BaseModel'
import { column, beforeCreate } from '@ioc:Adonis/Lucid/Orm'
//import type AuthConfig from 'Config/auth';

export interface TwoFactorAuthSettings {
  enabled: boolean
  method: 'sms' | 'call' | 'app'
  secret: string | null
}

export default class Settings extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public userId: string

  @column()
  public twoFactorAuth: TwoFactorAuthSettings
}
