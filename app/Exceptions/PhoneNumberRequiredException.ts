import ApiException from 'App/Exceptions/ApiException'

export default class PhoneNumberRequiredException extends ApiException {
  status = 422;
  message = "Please setup phone number before proceed.";
}