import { Request } from "~/core/express";
import Validator from "Validator";

interface LoginRequest {
  body: { 
    email: string;
    password: string;
    otp?: string;
  }
}

class LoginRequest extends Request {
  static rules() {
    return {
      email: Validator.string().email().required(),
      password: Validator.string().required(),
      otp: Validator.string()
    }
  }
}

export default LoginRequest;