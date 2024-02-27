import ValidationException from '#app/Exceptions/Validation/ValidationException'

export default class DuplicateUsernameException extends ValidationException {
  public fieldsWithRule = {
    username: 'unique',
  }
}
