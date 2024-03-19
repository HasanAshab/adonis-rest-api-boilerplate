import ApiException from '#exceptions/api_exception'

export default class InvalidPasswordException extends ApiException {
  static status = 401
  static message = 'Incorrect password, try again.'
}
