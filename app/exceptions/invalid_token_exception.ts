import ApiException from '#exceptions/api_exception'

export default class InvalidTokenException extends ApiException {
  static status = 401
  static message = 'Invalid or expired token.'
}
