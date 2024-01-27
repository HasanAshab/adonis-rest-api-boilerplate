import { Request } from "~/core/express";
import Validator from "Validator";

interface ResetPasswordRequest {
  body: { 
    id: string;
    token: string;
    password: string;
  }
}

class ResetPasswordRequest extends Request {
  static rules() {
    return {
      id: Validator.string().required(),
      token: Validator.string().required(),
      password: Validator.string().password().required()
    }
  }
}

export default ResetPasswordRequest;