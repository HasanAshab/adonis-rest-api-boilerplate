import type { HashContract } from '@ioc:Adonis/Core/Hash';
import type { UserProviderContract } from '@ioc:Adonis/Addons/Auth';
import type { Model } from 'mongoose';
import MongoDbAuthProviderConfig from './MongoDbAuthProviderConfig';
import ProviderUser from './ProviderUser';

export default class MongoDBAuthProvider<IUser extends object>
	implements UserProviderContract<IUser>
{
	private model?: Model;

	constructor(
		public config: MongoDbAuthProviderConfig<IUser>,
		private hash: HashContract,
	) {}

	private async resolveModel() {
		if (!this.model) {
			this.model = (await this.config.model()).default;
		}
		return this.model;
	}

	public async getUserFor(user: IUser | null) {
		return new ProviderUser(user, this.hash);
	}

	public async updateRememberMeToken(user: ProviderUser) {
		const User = await this.resolveModel();
		await User.updateOneById(user.getId(), {
			rememberMeToken: user.getRememberMeToken(),
		});
	}

	public async findById(id: string | number) {
		const User = await this.resolveModel();
		const user = await User.findById(id);
		return this.getUserFor(user || null);
	}

	public async findByUid(uidValue: string) {
		const User = await this.resolveModel();
		const query = User.findOne();

		this.config.uids.forEach((uid) => {
			query.where(uid).equals(uidValue);
		});

		const user = await query;
		return this.getUserFor(user || null);
	}

	public async findByRememberMeToken(userId: string | number, token: string) {
		const User = await this.resolveModel();
		const user = await User.findById(userId)
			.where('rememberMeToken')
			.equals(token);
		return this.getUserFor(user || null);
	}
}
