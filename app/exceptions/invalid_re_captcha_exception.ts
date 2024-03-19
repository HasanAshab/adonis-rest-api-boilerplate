import ApiException from '#exceptions/api_exception'

export default class InvalidReCaptchaException extends ApiException {
  static status = 403
}