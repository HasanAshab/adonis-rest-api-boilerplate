import ApiException from '#app/Exceptions/ApiException'

export default class InvalidOtpException extends ApiException {
  status = 401
  message = 'Invalid OTP, please try again.'
}
