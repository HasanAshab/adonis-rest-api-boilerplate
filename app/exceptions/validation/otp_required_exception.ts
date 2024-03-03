import ValidationException from '#exceptions/validation/validation_exception'


export default class OtpRequiredException extends ValidationException {
  public fieldsWithRule = { 
    otp: 'required'
  }
}
