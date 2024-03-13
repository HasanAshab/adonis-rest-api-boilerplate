import ApiException from '#exceptions/api_exception'

export default class InvalidTokenException extends ApiException {
  static status = 401
  message = 'Invalid or expired token.'
}
