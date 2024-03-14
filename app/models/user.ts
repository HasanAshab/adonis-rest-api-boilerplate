import BaseModel from '#models/base_model'
import { column } from '@adonisjs/lucid/orm'
//import { attachment, AttachmentContract } from '@ioc:adonis/addons/attachment_lite'
import { compose } from '@adonisjs/core/helpers'
import config from '@adonisjs/core/services/config'
import hash from '@adonisjs/core/services/hash'
import HasFactory from '#models/traits/has_factory/mixin'
import UserFactory from '#database/factories/user_factory'
import HasTimestamps from '#models/traits/has_timestamps'
import HasApiTokens from '#models/traits/has_api_tokens'
import TwoFactorAuthenticable from '#models/traits/two_factor_authenticable'
import SocialAuthenticable from '#models/traits/social_authenticable'
//import OptInNotifiable from '#models/traits/opt_in_notifiable'
import InvalidPasswordException from '#exceptions/invalid_password_exception'
import { withAuthFinder } from '@adonisjs/auth'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'


const AuthFinder = withAuthFinder(() => hash.use(), {
  uids: ['email'],
  passwordColumnName: 'password',
})


export type Role = 'user' | 'admin'

export default class User extends compose(
  BaseModel,
  AuthFinder,
  HasFactory,
  HasTimestamps,
  HasApiTokens,
  //OptInNotifiable,
  TwoFactorAuthenticable,
  SocialAuthenticable
) {
  public currentAccessToken?: string
  public static accessTokens = DbAccessTokensProvider.forModel(User)
  public static findForAuth<T extends typeof UserWithUserFinder>(
    this: T,
    uids: string[],
    value: string
  ): Promise<InstanceType<T> | null> {
    const query = this.query()
    uids.forEach((uid) => query.orWhere(uid, value))
    return query.whereNotNull('password').limit(1).first()
  }

  static factoryClass = UserFactory 
  
  
  @column({ isPrimary: true })
  declare id: number

  @column()
  public name: string | null = null

  @column()
  public username: string | null = null

  @column()
  declare email: string

 // @attachment()
//  declare avatar: AttachmentContract = null

  @column()
  public phoneNumber: string | null = null

  @column()
  public role: Role = 'user'

  @column()
  public verified = false

  @column({ serializeAs: null })
  public password: string | null = null

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
