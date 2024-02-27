import { Request } from '~/core/express'
import Validator from 'validator'

interface ForgotPasswordRequest {
  body: { email: string }
}

class ForgotPasswordRequest extends Request {
  static rules() {
    return {
      email: Validator.string().email().required(),
    }
  }
}

export default ForgotPasswordRequest
