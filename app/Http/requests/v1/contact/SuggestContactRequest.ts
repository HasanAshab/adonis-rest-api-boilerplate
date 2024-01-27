import { AuthenticRequest } from "~/core/express";
import Validator from "Validator";

interface SuggestContactRequest {
  query: { 
    q: string;
    status?: "opened" | "closed";
    limit?: string;
  }
}

class SuggestContactRequest extends AuthenticRequest {
  static rules() {
    return {
      q: Validator.string().required(),
      status: Validator.string().valid("opened", "closed"),
      limit: Validator.number(),
    }
  }
}

export default SuggestContactRequest;