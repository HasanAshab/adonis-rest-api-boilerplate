import { Exception } from '@adonisjs/core/build/standalone'

export default class PasswordChangeNotAllowedException extends Exception {
  status = 403;
  message = "Changing password is not allowed for this account.";
}