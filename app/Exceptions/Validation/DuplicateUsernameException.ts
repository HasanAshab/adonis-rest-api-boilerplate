import ValidationException from 'App/Exceptions/Validation/ValidationException'

export default class DuplicateUsernameException extends ValidationException {
  public fieldsWithRule = {
    username: 'unique',
  }
}
