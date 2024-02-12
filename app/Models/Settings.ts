import BaseModel from 'App/Models/BaseModel'
import { column, beforeCreate } from '@ioc:Adonis/Lucid/Orm'
//import type AuthConfig from 'Config/auth';
import NotificationService from 'App/Services/NotificationService'

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

  @column()
  public notificationPreference: Record<string, string[]>
  
  //TODO
  @beforeCreate()
  public static async setDefaultNotificationPreferenceIfNotSet(settings: Settings, notificationService = new NotificationService) {
    settings.notificationPreference = await notificationService.defaultPrefrence()
  }
}
