import ApiException from '#app/Exceptions/ApiException'

export default class InvalidRecoveryCodeException extends ApiException {
  status = 401
  message = 'Invalid recovery code.'
}
