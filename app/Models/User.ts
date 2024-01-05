import {
	BaseModel,
	column,
	beforeSave,
	hasOne,
	HasOne,
} from '@ioc:Adonis/Lucid/Orm'
import { attachment, AttachmentContract } from '@ioc:Adonis/Addons/AttachmentLite'
import { compose } from '@poppinss/utils/build/helpers'
import Settings from 'App/Models/Settings'
import HasFactory from 'App/Models/Traits/HasFactory'
import HasTimestamps from 'App/Models/Traits/HasTimestamps'
import Authenticatable from 'App/Models/Traits/Authenticatable'


export default class User extends compose(BaseModel, HasFactory, HasTimestamps, Authenticatable) {
	@column({ isPrimary: true })
	public id: number;

	@column()
	public name?: string;	
	
	@column()
	public username?: string;

	@column()
	public email: string;

	@attachment()
	public profile?: AttachmentContract;

	@column()
	public phoneNumber?: string;

	@column()
	public role: 'novice' | 'admin';

	@column()
	public verified: boolean;

	@column({ serializeAs: null })
	public password?: string;

	@column({ serializeAs: null })
	public recoveryCodes: string[];

	@column({ serializeAs: null })
	public socialId: Record<string, string>;

	@hasOne(() => Settings)
	public settings: HasOne<typeof Settings>;


	public get isAdmin() {
		return this.role === 'admin';
	}

	public get isInternal() {
		return !!this.password;
	}

	public static internals() {
		return this.query().whereNotNull('password');
	}
}