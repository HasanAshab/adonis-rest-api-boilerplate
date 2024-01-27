import { Request } from "~/core/express";
import Validator from "Validator";

interface ResendEmailVerificationRequest {
  body: { 
    email: string;
  }
}

class ResendEmailVerificationRequest extends Request {
  static rules() {
    return {
      email: Validator.string().email().required()
    }
  }
}

export default ResendEmailVerificationRequest;