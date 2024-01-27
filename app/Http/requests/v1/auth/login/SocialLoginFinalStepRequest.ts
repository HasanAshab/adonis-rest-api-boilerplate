import { Request } from "~/core/express";
import Validator, { unique } from "Validator";

interface SocialLoginFinalStepRequest {
  body: { 
    externalId: string;
    token: string;
    username: string;
    email?: string;
  }
}

class SocialLoginFinalStepRequest extends Request {
  static rules() {
    return {
      externalId: Validator.string().required(),
      token: Validator.string().required(),
      username: Validator.string().alphanum().external(unique("User", "username")).required(),
      email: Validator.string().email().external(unique("User", "email")),
    }
  }
}

export default SocialLoginFinalStepRequest;