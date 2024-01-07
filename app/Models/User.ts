import BaseModel from "App/Models/BaseModel";
import { column, hasOne, HasOne, beforeSave } from '@ioc:Adonis/Lucid/Orm'
import { attachment, AttachmentContract } from '@ioc:Adonis/Addons/AttachmentLite'
import type { Exception } from '@adonisjs/core/build/standalone';
import { compose } from '@poppinss/utils/build/helpers'
import Hash from '@ioc:Adonis/Core/Hash';
import Settings from 'App/Models/Settings'
import HasFactory from 'App/Models/Traits/HasFactory'
import HasTimestamps from 'App/Models/Traits/HasTimestamps'


export default class User extends compose(BaseModel, HasFactory, HasTimestamps) {
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
	
	public assertHasPassword(exception?: Exception): asserts this is this & { password: string } {
    if (this.password) return;
    if(exception) {
      throw exception;
    }
		throw new Error('The user must have a password to perform this action');
  }

	
	@beforeSave()
	public static async hashPasswordIfModified(user: User) {
	  if (user.$dirty.password) {
    	user.password = await Hash.make(user.password);
    }
	}

	public static internals() {
		return this.query().whereNotNull('password');
	}
	
	public comparePassword(password: string) {
		this.assertHasPassword();
		return Hash.verify(this.password, password);
	}
	
  public async changePassword(oldPassword: string, newPassword: string) {
		this.assertHasPassword(new PasswordChangeNotAllowedException);

		if (!await this.attempt(oldPassword)) {
			throw new InvalidPasswordException();
		}

		this.password = newPassword;
		await this.save();
		//TODO Should not be there
		await Mail.to(user.email).send(new PasswordChangedMail()).catch(log);
  }
  
  
}