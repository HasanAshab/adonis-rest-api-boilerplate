import ApiException from '#app/Exceptions/ApiException'

export default class PhoneNumberRequiredException extends ApiException {
  status = 400
  message = 'Please setup phone number before proceed.'
}
