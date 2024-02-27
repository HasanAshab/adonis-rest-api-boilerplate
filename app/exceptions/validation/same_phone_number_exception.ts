import ValidationException from '#app/Exceptions/Validation/ValidationException'

export default class SamePhoneNumberException extends ValidationException {
  public fieldsWithRule = {
    phoneNumber: 'Phone number should not be same as old one!'
  }
}