import ValidationException from '#app/exceptions/validation/validation_exception'

export default class EmailRequiredException extends ValidationException {
  public fieldsWithRule = { 
    email: 'required'
  }
}
