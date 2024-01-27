import { AuthenticRequest } from "~/core/express";
import Validator from "Validator";

interface ChangePasswordRequest {
  body: { 
    oldPassword: string;
    newPassword: string;
  }
}

class ChangePasswordRequest extends AuthenticRequest {
  static rules() {
    return {
      oldPassword: Validator.string().required(),
      newPassword: Validator.string().password().required()
    }
  }
}

export default ChangePasswordRequest;