import BaseModel from '#models/base_model'
import { column, beforeSave } from '@adonisjs/lucid/orm'
import { attachment, AttachmentContract } from '@ioc:adonis/addons/attachment_lite'
import { compose } from '@poppinss/utils/build/helpers'
import config from '@adonisjs/core/services/config'
import hash from '@adonisjs/core/services/hash'
import HasFactory from '#models/traits/has_factory'
import HasTimestamps from '#models/traits/has_timestamps'
import HasApiTokens from '#models/traits/has_api_tokens'
import TwoFactorAuthenticable from '#models/traits/two_factor_authenticable'
import SocialAuthenticable from '#models/traits/social_authenticable'
import OptInNotifiable from '#models/traits/opt_in_notifiable'
import InvalidPasswordException from '#exceptions/invalid_password_exception'


export type Role = 'user' | 'admin'
//export type Role = typeof import('Config/app')['constraints']['user']['role'][number]

export default class User extends compose(
  BaseModel,
  HasFactory,
  HasTimestamps,
  HasApiTokens,
  OptInNotifiable,
  TwoFactorAuthenticable,
  SocialAuthenticable
) {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string | null = null

  @column()
  declare username: string | null = null

  @column()
  declare email: string

  @attachment()
  declare avatar: AttachmentContract = null

  @column()
  declare phoneNumber: string | null = null

  @column()
  declare role: Role = 'user'

  @column()
  declare verified = false

  @column({ serializeAs: null })
  declare password: string | null = null

  public get isAdmin() {
    return this.role === 'admin'
  }

  public async avatarUrl() {
    return (await this.avatar?.getUrl()) ?? this.socialAvatarUrl
  }

  public markAsVerified() {
    this.verified = true
    return this.save()
  }

  public async generateUsername(maxAttempts?: number) {
    if (!this.email) {
      throw new Error('User must have an email before trying to generate username')
    }

    return (this.username = await User.generateUsername(this.email, maxAttempts))
  }

  public static async generateUsername(email: string, maxAttempts = 10) {
    const USERNAME_MAX_LENGTH = config.get('app.constraints.user.username.maxLength')
    const name = email.split('@')[0].replace(/[&/\\#,+()$~%._@'":*?<>{}]/g, '')
    let username = name

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      if (await User.notExists('username', username)) {
        return username
      }

      username = name + attempt
      if (username.length > USERNAME_MAX_LENGTH) {
        username =
          name.substring(0, name.length - (username.length - USERNAME_MAX_LENGTH)) + attempt
      }
    }

    return null
  }

  @beforeSave()
  public static async hashPasswordIfModified(user: User) {
    if (user.$dirty.password) {
      user.password = await hash.make(user.password)
    }
  }

  public static internals() {
    return this.query().whereNotNull('password')
  }

  public static withRole(role: Role) {
    return this.query().where('role', role)
  }

  public comparePassword(password: string) {
    if (!this.password) {
      throw new Error('The user must have a password to compare with')
    }
    return hash.verify(this.password, password)
  }

  public async verifyPassword(password: string) {
    if (!(await this.comparePassword(password))) {
      throw new InvalidPasswordException()
    }
  }
}
