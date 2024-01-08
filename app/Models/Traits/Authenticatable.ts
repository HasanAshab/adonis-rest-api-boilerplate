import Hash from '@ioc:Adonis/Core/Hash';
import crypto from 'crypto';
import { BaseModel, beforeSave } from '@ioc:Adonis/Lucid/Orm'
import { NormalizeConstructor } from '@ioc:Adonis/Core/Helpers'

eda lagbo na
//import EmailVerificationNotification from "App/Notifications/EmailVerificationNotification";
//import ForgotPasswordNotification from "App/Notifications/ForgotPasswordNotification";

/*
export default (schema: Schema) => {
  
	schema.methods.sendVerificationNotification = async function (
		version: string,
	) {
		await this.notify(new EmailVerificationNotification({ version }));
	};

	schema.methods.sendResetPasswordNotification = async function () {
		await this.notify(new ForgotPasswordNotification());
	};
};
*/

export type SuperclassConstructor = NormalizeConstructor<BaseModel> & { password?: string };

export default function Authenticatable(Superclass: SuperclassConstructor) {
  return class AuthenticatableModel extends Superclass {
    public static boot() {
      if (this.booted) return;
    
      super.boot();
      
      this.before('save', async user => {
    		if (user.$dirty.password) {
    			user.password = await Hash.make(user.password);
    		}
      });
	  }

  	public comparePassword(password: string) {
  		this.assertHasPassword();
  		return Hash.verify(this.password, password);
  	}
  	
	  public async changePassword(oldPassword: string, newPassword: string) {
			if (!this.isInternal) {
				throw new PasswordChangeNotAllowedException();
			}

			if (!(await this.attempt(oldPassword))) {
				throw new InvalidPasswordException();
			}

			this.password = newPassword;
			await this.save();
			//TODO Should not be there
			await Mail.to(user.email).send(new PasswordChangedMail()).catch(log);
	  }
	  
	  public assertHasPassword(): asserts this is this & { password: string } {
	     if (!this.password) {
  			throw new Error('The user must have a password to perform this action');
  		}
	  }
  }
}