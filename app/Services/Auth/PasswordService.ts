import { UserDocument } from 'App/Models/User';
import Token from 'App/Models/Token';
import Mail from 'Mail';
import PasswordChangedMail from 'App/Mails/PasswordChangedMail';
import PasswordChangeNotAllowedException from 'App/Exceptions/PasswordChangeNotAllowedException';
import InvalidPasswordException from 'App/Exceptions/InvalidPasswordException';

export default class PasswordService {
	async reset(user: UserDocument, token: string, password: string) {
		await Token.verify(user._id, 'resetPassword', token);
		user.password = password;
		await user.save();
		await Mail.to(user.email).send(new PasswordChangedMail()).catch(log);
	}

	async change(user: UserDocument, oldPassword: string, newPassword: string) {
		if (!user.isInternal) {
			throw new PasswordChangeNotAllowedException();
		}

		if (!(await user.attempt(oldPassword))) {
			throw new InvalidPasswordException();
		}

		user.password = newPassword;
		await user.save();
		//TODO Should not be there
		await Mail.to(user.email).send(new PasswordChangedMail()).catch(log);
	}
}
