import ApiException from '#exceptions/api_exception'

export default class InvalidOtpException extends ApiException {
  status = 401
  message = 'Invalid OTP, please try again.'
}
