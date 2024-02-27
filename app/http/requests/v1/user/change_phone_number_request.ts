import { AuthenticRequest } from '~/core/express'
import Validator from 'validator'

interface ChangePhoneNumberRequest {
  body: {
    phoneNumber: string
    otp?: string
  }
}

class ChangePhoneNumberRequest extends AuthenticRequest {
  static rules() {
    return {
      phoneNumber: Validator.string().required(),
      otp: Validator.string(),
    }
  }
}

export default ChangePhoneNumberRequest
