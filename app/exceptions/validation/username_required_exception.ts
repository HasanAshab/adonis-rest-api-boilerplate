import ValidationException from '#exceptions/validation/validation_exception'

export default class UsernameRequiredException extends ValidationException {
  fieldsWithRule = {
    username: 'required',
  }
}
