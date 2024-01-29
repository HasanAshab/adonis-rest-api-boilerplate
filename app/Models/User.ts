import BaseModel from "App/Models/BaseModel";
import { column, hasOne, beforeSave, HasOne, HasMany } from '@ioc:Adonis/Lucid/Orm'
import { attachment, AttachmentContract } from '@ioc:Adonis/Addons/AttachmentLite'
import { Exception } from '@adonisjs/core/build/standalone';
import { compose } from '@poppinss/utils/build/helpers'
import Hash from '@ioc:Adonis/Core/Hash';
import Settings from 'App/Models/Settings'
import HasFactory from 'App/Models/Traits/HasFactory'
import HasTimestamps from 'App/Models/Traits/HasTimestamps'
import HasApiTokens from 'App/Models/Traits/HasApiTokens'
import { Notifiable } from '@ioc:Verful/Notification/Mixins'
import InvalidPasswordException from 'App/Exceptions/InvalidPasswordException'

const USERNAME_MAX_LENGTH = 20

export type Role = 'user' | 'admin';

export default class User extends compose(BaseModel, HasFactory, HasTimestamps, HasApiTokens, Notifiable('notifications')) {
	@column({ isPrimary: true })
	public id: number;

	@column()
	public name?: string;	
	
	@column()
	public username?: string;

	@column()
	public email: string;

	@attachment()
	public avatar?: AttachmentContract;

	@column()
	public phoneNumber?: string;

	@column()
	public role: Role;

	@column()
	public verified = false;

	@column({ serializeAs: null })
	public password?: string;

	@column({ serializeAs: null })
	public recoveryCodes?: string[];

  @column({ serializeAs: null })
	public socialProvider?: string;
  
	@column({ serializeAs: null })
	public socialId?: string;
  
  @column()
  public socialAvatarUrl?: string;
  
	@hasOne(() => Settings)
	public settings: HasOne<typeof Settings>;
  
	public get isAdmin() {
		return this.role === 'admin';
	}
	
	public async avatarUrl() {
		return await this.avatar?.getUrl() 
		  ?? this.socialAvatarUrl;
	}
  
  public markAsVerified() {
    this.verified = true;
    return this.save();
  }

  public async generateUsername(maxAttempts = 10) {
    if(!this.email) {
      throw new Error('User must have a email before trying to generate username');
    }
    
    const name = this.email
      .split('@')[0]
      .replace(/[&/\\#,+()$~%._@'":*?<>{}]/g, "");
    
    let username = name;

    for(let attempt = 1; attempt <= maxAttempts; attempt++) {
      if(await User.notExists('username', username)) {
        return this.username = username;
      }
      
      username = name + attempt;
      if(username.length > USERNAME_MAX_LENGTH) {
        username = name.substring(0, name.length - (username.length - USERNAME_MAX_LENGTH)) + attempt;
      }
    }
    
    return null;
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
	
	public static withRole(role: Role) {
	  return this.query().where("role", role);
	}
	
	public comparePassword(password: string) {
    if (!this.password) {
      throw new Error('The user must have a password to compare with');
    }
		return Hash.verify(this.password, password);
	}
	
	public async verifyPassword(password: string) {
	  if (!await this.comparePassword(password)) {
			throw new InvalidPasswordException();
		}
	}
}