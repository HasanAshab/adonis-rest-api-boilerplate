import ValidationException from '#exceptions/validation/validation_exception'

export default class DuplicateUsernameException extends ValidationException {
  fieldsWithRule = {
    username: 'unique',
  }
}
