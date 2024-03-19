import ValidationException from '#exceptions/validation/validation_exception'

export default class EmailRequiredException extends ValidationException {
  fieldsWithRule = {
    email: 'required',
  }
}
