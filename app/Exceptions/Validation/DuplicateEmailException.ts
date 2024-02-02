import ValidationException from 'App/Exceptions/Validation/ValidationException'

export default class DuplicateEmailException extends ValidationException {
  public fieldsWithRule ={
    email: 'unique'
  }
}