import ApiException from '#app/exceptions/api_exception'

export default class LoginAttemptLimitExceededException extends ApiException {
  status = 429
  message = 'Too Many Failed Attempts, try again later.'
}
