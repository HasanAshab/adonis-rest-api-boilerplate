import Hash from '@ioc:Adonis/Core/Hash';
import crypto from 'crypto';
import { BaseModel, beforeSave } from '@ioc:Adonis/Lucid/Orm'
import { NormalizeConstructor } from '@ioc:Adonis/Core/Helpers'

//import EmailVerificationNotification from "App/Notifications/EmailVerificationNotification";
//import ForgotPasswordNotification from "App/Notifications/ForgotPasswordNotification";

/*
export default (schema: Schema) => {
  
	schema.methods.attempt = function (password: string) {
		if (!this.password) {
			throw new Error(
				'Trying to attempt passwordless user (may be social account?)',
			);
		}
		return Hash.verify(this.password, password);
	};

	schema.methods.setPassword = async function (password: string) {
		this.password = await Hash.make(password);
	};

	schema.method(
		'changePassword',
		async function (oldPassword: string, newPassword: string) {
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
		},
	);

	schema.methods.sendVerificationNotification = async function (
		version: string,
	) {
		await this.notify(new EmailVerificationNotification({ version }));
	};

	schema.methods.sendResetPasswordNotification = async function () {
		await this.notify(new ForgotPasswordNotification());
	};

	schema.methods.generateRecoveryCodes = async function (count = 10) {
		const rawCodes: string[] = [];
		const promises: Promise<void>[] = [];
		for (let i = 0; i < count; i++) {
			const generateCode = async () => {
				const code = crypto.randomBytes(8).toString('hex');
				rawCodes.push(code);
				this.recoveryCodes = await Hash.make(code);
			};
			promises.push(generateCode());
		}
		await Promise.all(promises);
		await this.save();
		return rawCodes;
	};

	schema.methods.verifyRecoveryCode = async function (code: string) {
		for (let i = 0; i < this.recoveryCodes.length; i++) {
			const hashedCode = this.recoveryCodes[i];
			if (await Hash.verify(hashedCode, code)) {
				this.recoveryCodes.splice(i, 1);
				await this.save();
				return true;
			}
		}
		return false;
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
  		if (!this.password) {
  			throw new Error('Trying to attempt passwordless user [may be social account?]');
  		}
  		return Hash.verify(this.password, password);
  	}
  }
}