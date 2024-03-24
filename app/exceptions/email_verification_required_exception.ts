import ApiException from '#exceptions/api_exception'

export default class EmailVerificationRequiredException extends ApiException {
  static status = 500
  static message = 'Your have to verify your email to perfom this action.'
}
