import ApiException from '#exceptions/api_exception'

export default class InvalidCredentialException extends ApiException {
  static static status = 401
  static message = 'Credentials not match.'
}
