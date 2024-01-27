import { AuthenticRequest } from "~/core/express";
import Validator from "Validator";

interface UpdateContactStatusRequest {
  body: { 
    status: "opened" | "closed";
  }
}

class UpdateContactStatusRequest extends AuthenticRequest {
  static rules() {
    return {
      status: Validator.string().valid("opened", "closed").required(),
    }
  }
}

export default UpdateContactStatusRequest;