import ValidationException from 'App/Exceptions/Validation/ValidationException'

export default class EmailAndUsernameRequiredException extends ValidationException {
  public fieldsWithRule = {
    email: 'required',
    username: 'required'
  }
}