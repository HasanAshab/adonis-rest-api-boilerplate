import { Exception } from '@adonisjs/core/build/standalone'

export default class InvalidCredentialException extends Exception {
  status = 401;
  message = "Credentials not match.";
}