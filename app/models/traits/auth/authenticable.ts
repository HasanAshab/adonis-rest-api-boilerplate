import type { NormalizeConstructor } from '@adonisjs/core/types/helpers'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth'
import hash from '@adonisjs/core/services/hash'

export default function Authenticable(Superclass: NormalizeConstructor<typeof BaseModel>) {
  const AuthFinder = withAuthFinder(() => hash.use(), {
    uids: ['email'],
    passwordColumnName: 'password',
  })

  class AuthenticableModel extends compose(Superclass, AuthFinder) {
    static findForAuth<T extends typeof UserWithUserFinder>(
      this: T,
      uids: string[],
      value: string
    ): Promise<InstanceType<T> | null> {
      const query = this.query()
      uids.forEach((uid) => query.orWhere(uid, value))
      return query.whereNotNull('password').limit(1).first()
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
