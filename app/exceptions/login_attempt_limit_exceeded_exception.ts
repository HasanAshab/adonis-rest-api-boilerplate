import ApiException from '#exceptions/api_exception'

export default class LoginAttemptLimitExceededException extends ApiException {
  static status = 429
  static message = 'Too Many Failed Attempts, try again later.'
}
