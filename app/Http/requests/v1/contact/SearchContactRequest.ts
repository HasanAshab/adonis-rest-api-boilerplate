import { AuthenticRequest } from "~/core/express";
import Validator from "Validator";

interface SearchContactRequest {
  query: { 
    q: string;
    status?: "opened" | "closed";
    limit?: string;
    cursor?: string;
  }
}

class SearchContactRequest extends AuthenticRequest {
  static rules() {
    return {
      q: Validator.string().required(),
      status: Validator.string().valid("opened", "closed"),
      limit: Validator.number(),
      cursor: Validator.string()
    }
  }
}

export default SearchContactRequest;