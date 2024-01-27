import { Request } from "~/core/express";
import Validator from "Validator";


interface ContactRequest {
  body: { 
    email: string;
    subject: string;
    message: string;
  };
}

class ContactRequest extends Request {
  static rules() {
    return {
      email: Validator.string().email().required(),
      subject: Validator.string().min(5).max(72).sanitize().required(),
      message: Validator.string().min(20).max(300).sanitize().required()
    }
  }
}

export default ContactRequest;