import ValidationException from 'App/Exceptions/Validation/ValidationException'

export default class UsernameRequiredException extends ValidationException {
  public fieldsWithRule = {
    username: 'required'
  }
}