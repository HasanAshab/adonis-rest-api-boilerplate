import BaseModel from '#models/base_model'
import { column } from '@adonisjs/lucid/orm'
//import { attachment, AttachmentContract } from '@ioc:adonis/addons/attachment_lite'
import { compose } from '@adonisjs/core/helpers'
import TwoFactorAuthenticable from '#models/traits/auth/two_factor_authenticable'
import SocialAuthenticable from '#models/traits/auth/social_authenticable'
import HasTrackableApiTokens from '#models/traits/api_token/has_trackable_api_tokens'
import HasTimestamps from '#models/traits/has_timestamps'
//import OptInNotifiable from '#models/traits/opt_in_notifiable'
import HasRole from '#models/traits/has_role'

export default class User extends compose(
  BaseModel,
  TwoFactorAuthenticable,
  SocialAuthenticable,
  HasTrackableApiTokens,
  HasTimestamps,
  //OptInNotifiable,
  HasRole
) {
  @column({ isPrimary: true })
  declare id: number

  @column()
  public name: string | null = null

  @column()
  public username: string | null = null

  @column()
  public phoneNumber: string | null = null

  //@attachment()
  //  declare avatar: AttachmentContract = null

  async avatarUrl() {
    return (await this.avatar?.getUrl()) ?? this.socialAvatarUrl
  }
}
