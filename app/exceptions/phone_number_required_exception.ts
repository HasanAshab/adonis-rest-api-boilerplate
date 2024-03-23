import ApiException from '#exceptions/api_exception'

export default class PhoneNumberRequiredException extends ApiException {
  static status = 400
  static message = 'Please setup phone number before proceed.'
}
