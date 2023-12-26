import { Exception } from '@adonisjs/core/build/standalone'

export default class InvalidTokenException extends Exception {
    status = 401;
    message = "Invalid or expired token.";
  }
}