import ValidationException from '#exceptions/validation/validation_exception'

export default class DuplicateEmailAndUsernameException extends ValidationException {
  public fieldsWithRule = {
    email: 'unique',
    username: 'unique',
  }
}
