import ValidationException from '#app/Exceptions/Validation/ValidationException'

export default class UsernameRequiredException extends ValidationException {
  public fieldsWithRule = {
    username: 'required',
  }
}
