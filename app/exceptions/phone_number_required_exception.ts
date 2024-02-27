import ApiException from '#app/exceptions/api_exception'

export default class PhoneNumberRequiredException extends ApiException {
  status = 400
  message = 'Please setup phone number before proceed.'
}
