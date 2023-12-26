import { Exception } from '@adonisjs/core/build/standalone'

export default class InvalidPasswordException extends Exception {
  status = 401;
  message = "Incorrect password, try again.";
}