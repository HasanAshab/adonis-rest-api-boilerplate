import ValidationException from '#exceptions/validation/validation_exception'

export default class DuplicateUsernameException extends ValidationException {
  public fieldsWithRule = {
    username: 'unique',
  }
}
