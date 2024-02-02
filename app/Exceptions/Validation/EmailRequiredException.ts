import ValidationException from 'App/Exceptions/Validation/ValidationException'

export default class EmailRequiredException extends ValidationException {
  public fieldsWithRule = {
    email: 'required'
  }
}