import BaseModel from '#models/base_model'
import { column } from '@adonisjs/lucid/orm'
//import { attachment, AttachmentContract } from '@ioc:adonis/addons/attachment_lite'
import { compose } from '@adonisjs/core/helpers'
import hash from '@adonisjs/core/services/hash'
import Authenticable from '#models/traits/auth/authenticable'
import TwoFactorAuthenticable from '#models/traits/auth/two_factor_authenticable'
import SocialAuthenticable from '#models/traits/auth/social_authenticable'
import HasTrackableApiTokens from '#models/traits/api_token/has_trackable_api_tokens'
import HasFactory from '#models/traits/has_factory/mixin'
import UserFactory from '#database/factories/user_factory'
import HasTimestamps from '#models/traits/has_timestamps'
//import OptInNotifiable from '#models/traits/opt_in_notifiable'
import HasRole from '#models/traits/has_role'

class User {}
export default User as any
/*
export default class User extends compose(
  BaseModel,
  Authenticable,
  TwoFactorAuthenticable,
  SocialAuthenticable,
  HasTrackableApiTokens,
  HasFactory,
  HasTimestamps,
  //OptInNotifiable,
  HasRole
) {
  static factoryClass = UserFactory

  @column({ isPrimary: true })
  declare id: number

  @column()
  name: string | null = null

  @column()
  username: string | null = null

  @column()
  declare email: string

  @column()
  phoneNumber: string | null = null

  @column()
  verified = false

  @column({ serializeAs: null })
  password: string | null = null

  //@attachment()
  //  declare avatar: AttachmentContract = null

  async avatarUrl() {
    return (await this.avatar?.getUrl()) ?? this.socialAvatarUrl
  }
}
*/
