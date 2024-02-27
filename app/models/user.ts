import BaseModel from '#app/Models/BaseModel'
import { column, beforeSave } from '@adonisjs/lucid/orm'
import { attachment, AttachmentContract } from '@ioc:Adonis/Addons/AttachmentLite'
import { compose } from '@poppinss/utils/build/helpers'
import Config from '@ioc:Adonis/Core/Config'
import hash from '@adonisjs/core/services/hash'
import HasFactory from '#app/Models/Traits/HasFactory'
import HasTimestamps from '#app/Models/Traits/HasTimestamps'
import HasApiTokens from '#app/Models/Traits/HasApiTokens'
import TwoFactorAuthenticable from '#app/Models/Traits/TwoFactorAuthenticable'
import SocialAuthenticable from '#app/Models/Traits/SocialAuthenticable'
import OptInNotifiable from '#app/Models/Traits/OptInNotifiable'
import InvalidPasswordException from '#app/Exceptions/InvalidPasswordException'


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
  public id: number

  @column()
  public name: string = null

  @column()
  public username: string = null

  @column()
  public email: string

  @attachment()
  public avatar: AttachmentContract = null

  @column()
  public phoneNumber: string = null

  @column()
  public role: Role = 'user'

  @column()
  public verified = false

  @column({ serializeAs: null })
  public password: string = null

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
    const USERNAME_MAX_LENGTH = Config.get('app.constraints.user.username.maxLength')
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
