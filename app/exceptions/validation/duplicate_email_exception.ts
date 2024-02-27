import ValidationException from '#app/exceptions/validation/validation_exception'

export default class DuplicateEmailException extends ValidationException {
  public fieldsWithRule = {
    email: 'unique',
  }
}
