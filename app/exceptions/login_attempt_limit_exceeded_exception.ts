import ApiException from '#app/Exceptions/ApiException'

export default class LoginAttemptLimitExceededException extends ApiException {
  status = 429
  message = 'Too Many Failed Attempts, try again later.'
}