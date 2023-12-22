import type { HashContract } from '@ioc:Adonis/Core/Hash'
import type { ProviderUserContract } from '@ioc:Adonis/Addons/Auth'
import type { IUser } from 'App/Models/User'

export default class ProviderUser implements ProviderUserContract<IUser> {
  constructor(public user: IUser | null, private hash: HashContract) {}

  public getId() {
    return this.user ? this.user._id : null
  }

  public getRememberMeToken() {
    return this.user?.rememberMeToken || null
  }

  public setRememberMeToken(token: string) {
    if (this.user) {
      this.user.rememberMeToken = token
    }
  }

  public async verifyPassword(plainPassword: string) {
    if (!this.user) {
      throw new Error('Cannot verify password for non-existing user')
    }

    return this.hash.verify(this.user.password, plainPassword)
  }
}
