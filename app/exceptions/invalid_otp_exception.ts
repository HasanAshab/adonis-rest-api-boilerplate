import ApiException from '#exceptions/api_exception'

export default class InvalidOtpException extends ApiException {
  static static status = 401
  static message = 'Invalid OTP, please try again.'
}
