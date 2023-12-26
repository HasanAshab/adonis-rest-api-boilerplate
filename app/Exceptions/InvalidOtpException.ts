import { Exception } from '@adonisjs/core/build/standalone'

export default class InvalidOtpException extends Exception {
  status = 401;
  message = "Invalid OTP, please try again.";
}