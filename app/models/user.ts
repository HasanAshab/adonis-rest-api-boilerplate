import BaseModel from '#models/base_model'
import { column } from '@adonisjs/lucid/orm'
//import { attachment, AttachmentContract } from '@ioc:adonis/addons/attachment_lite'
import { compose } from '@adonisjs/core/helpers'
import hash from '@adonisjs/core/services/hash'
import Authenticable from '#models/traits/auth/authenticable'
import TwoFactorAuthenticable from '#models/traits/auth/two_factor_authenticable'
import SocialAuthenticable from '#models/traits/auth/social_authenticable'
import HasApiTokens from '#models/traits/has_api_tokens'
import LoginActivityTrackable from '#models/traits/login_activity_trackable'
import HasFactory from '#models/traits/has_factory/mixin'
import UserFactory from '#database/factories/user_factory'
import HasTimestamps from '#models/traits/has_timestamps'
//import OptInNotifiable from '#models/traits/opt_in_notifiable'
import HasRole from '#models/traits/has_role'


export default class User extends compose(
  BaseModel,
  Authenticable,
  TwoFactorAuthenticable,
  SocialAuthenticable,
  HasApiTokens,
  LoginActivityTrackable,
  HasFactory,
  HasTimestamps,
  //OptInNotifiable,
  HasRole
) {
  static factoryClass = UserFactory 
  
  @column({ isPrimary: true })
  declare id: number

  @column()
  public name: string | null = null

  @column()
  public username: string | null = null

  @column()
  declare email: string

  @column()
  public phoneNumber: string | null = null

  @column()
  public verified = false

  @column({ serializeAs: null })
  public password: string | null = null

  //@attachment()
//  declare avatar: AttachmentContract = null

  public async avatarUrl() {
    return await this.avatar?.getUrl()
      ?? this.socialAvatarUrl
  }
}
