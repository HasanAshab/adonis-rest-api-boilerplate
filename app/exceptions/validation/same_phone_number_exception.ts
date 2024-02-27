import ValidationException from '#app/exceptions/validation/validation_exception'

export default class SamePhoneNumberException extends ValidationException {
  public fieldsWithRule = {
    phoneNumber: 'Phone number should not be same as old one!'
  }
}