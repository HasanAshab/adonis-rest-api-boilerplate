import type { HashContract } from '@ioc:Adonis/Core/Hash'
import type { UserProviderContract } from '@ioc:Adonis/Addons/Auth'
import MongoDbAuthProviderConfig from "./MongoDbAuthProviderConfig"
import User, { IUser } from 'App/Models/User'
import ProviderUser from "./ProviderUser"

export class MongoDbAuthProvider implements UserProviderContract<IUser> {
  constructor(public config: MongoDbAuthProviderConfig, private hash: HashContract) {}

  public async getUserFor(user: IUser | null) {
    return new ProviderUser(user, this.hash)
  }

  public async updateRememberMeToken(user: ProviderUser) {
    await User.updateOneById(user.getId(), { rememberMeToken: user.getRememberMeToken() });
  }

  public async findById(id: string | number) {
    const user = await User.findById(id)
    return this.getUserFor(user || null)
  }

  public async findByUid(uidValue: string) {
    const user = await User.findOne().where(this.config.uid).equals(uidValue);
    return this.getUserFor(user || null)
  }

  public async findByRememberMeToken(userId: string | number, token: string) {
    const user = await User.findById(userId).where('rememberMeToken').equals(token);
    return this.getUserFor(user || null)
  }
}