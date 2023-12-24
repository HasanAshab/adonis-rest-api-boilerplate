import { singleton } from "tsyringe";
import { UserDocument } from "~/app/models/User";
import Token from "~/app/models/Token";
import speakeasy from "speakeasy";
import Mail from "Mail";
import PasswordChangedMail from "~/app/mails/PasswordChangedMail";
import PasswordChangeNotAllowedException from "~/app/exceptions/PasswordChangeNotAllowedException";
import InvalidPasswordException from "~/app/exceptions/InvalidPasswordException";

@singleton()
export default class PasswordService {
  async reset(user: UserDocument, token: string, password: string) {
    await Token.verify(user._id, "resetPassword", token);
    await user.setPassword(password);
    user.tokenVersion++;
    await user.save();
    await Mail.to(user.email).send(new PasswordChangedMail()).catch(log);
  }
  
  async change(user: UserDocument, oldPassword: string, newPassword: string) {
    if(!user.password)
      throw new PasswordChangeNotAllowedException();
    if (!await user.attempt(oldPassword))
      throw new InvalidPasswordException();
    await user.setPassword(newPassword);
    user.tokenVersion++;
    await user.save();
    await Mail.to(user.email).send(new PasswordChangedMail()).catch(log);
  }
}
 