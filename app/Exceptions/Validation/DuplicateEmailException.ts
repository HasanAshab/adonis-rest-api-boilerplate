import ValidationException from '#app/Exceptions/Validation/ValidationException'

export default class DuplicateEmailException extends ValidationException {
  public fieldsWithRule = {
    email: 'unique',
  }
}
