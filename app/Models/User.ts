import { DateTime } from 'luxon'
import Hash from '@ioc:Adonis/Core/Hash'
import Settings from "App/Models/Settings";
import { BaseModel, column, beforeSave, hasOne, HasOne } from '@ioc:Adonis/Lucid/Orm'
import { attachment, AttachmentContract } from '@ioc:Adonis/Addons/AttachmentLite'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public username?: string  
  
  @column()
  public email: string
  
  @attachment()
  public profile?: AttachmentContract
  
  @column()
  public phoneNumber?: string
  
  @column()
  public role: 'novice' | 'user'
  
  @column()
  public verified: boolean
  
  @column({ serializeAs: null })
  public password?: string
  
  @column({ serializeAs: null })
  public recoveryCodes: string[]
  
  @column({ serializeAs: null })
  public socialId: Record<string, string>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  
  @hasOne(() => Settings)
  public settings: HasOne<typeof Settings>
  
  public createDefaultSettings() {
    return Settings.create({ userId: this.id });
  }

  public get isAdmin() {
    return this.role === 'admin'
  }
  
  public get isInternal() {
    return !!this.password
  }

  public static internals() {
    return this.query().whereNotNull('password')
  }
  
  public static internal() {
    return this.internals().first();
  }
  
  @beforeSave()
  public static async hashPassword (user: User) {
    if (user.$dirty.password) {
      user.password = await Hash.make(user.password)
    }
  }
}