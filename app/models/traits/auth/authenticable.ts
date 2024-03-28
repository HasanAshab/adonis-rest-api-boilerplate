import type { NormalizeConstructor } from '@adonisjs/core/types/helpers'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth'
import hash from '@adonisjs/core/services/hash'


export const AuthFinder = withAuthFinder(() => hash.use(), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default function Authenticable(Superclass: NormalizeConstructor<typeof BaseModel>) {
  class AuthenticableModel extends compose(Superclass, AuthFinder) {
    @column()
    declare email: string
    
    @column()
    public verified = false

    @column({ serializeAs: null })
    public password: string | null = null

    static findForAuth<T extends typeof AuthenticableModel>(
      this: T,
      uids: string[],
      value: string
    ): Promise<InstanceType<T> | null> {
      const query = this.query()
      uids.forEach((uid) => query.orWhere(uid, value))
      return query.whereNotNull('password').limit(1).first()
    }
    
    markAsVerified() {
      this.verified = true
      return this.save()
    }

    comparePassword(password: string) {
      if (!this.password) {
        throw new Error('The user must have a password to compare with')
      }
      return hash.verify(this.password, password)
    }
  }
  return AuthenticableModel
}
