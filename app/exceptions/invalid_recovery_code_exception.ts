import ApiException from '#exceptions/api_exception'

export default class InvalidRecoveryCodeException extends ApiException {
  status = 401
  message = 'Invalid recovery code.'
}
