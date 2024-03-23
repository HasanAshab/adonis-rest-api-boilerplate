import ApiException from '#exceptions/api_exception'

export default class InvalidRecoveryCodeException extends ApiException {
  static status = 401
  static message = 'Invalid recovery code.'
}
