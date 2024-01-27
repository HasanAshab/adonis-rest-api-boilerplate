import { Request } from "~/core/express";
import Validator from "Validator";

interface LoginWithRecoveryCodeRequest {
  body: { 
    email: string;
    code: string;
  };
}

class LoginWithRecoveryCodeRequest extends Request {
  static rules() {
    return {
      email: Validator.string().email().required(),
      code: Validator.string().required()
    }
  }
}

export default LoginWithRecoveryCodeRequest;