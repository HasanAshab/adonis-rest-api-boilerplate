import ApiException from '#exceptions/api_exception'

export default class LoginAttemptLimitExceededException extends ApiException {
  static status = 429
  message = 'Too Many Failed Attempts, try again later.'
}
