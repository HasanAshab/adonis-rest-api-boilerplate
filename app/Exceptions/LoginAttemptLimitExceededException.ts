import { Exception } from '@adonisjs/core/build/standalone'

export default class LoginAttemptLimitExceededException extends Exception {
  status = 429
  message = "Too Many Failed Attempts, try again later.";
}