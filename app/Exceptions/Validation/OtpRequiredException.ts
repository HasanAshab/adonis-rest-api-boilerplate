import ValidationException from 'App/Exceptions/Validation/ValidationException'


export default class OtpRequiredException extends ValidationException {
  public fieldsWithRule = { 
    otp: 'required'
  }
}
