import { Request } from "~/core/express";
import Validator, { unique } from "Validator";
import { UploadedFile } from "express-fileupload";

interface SetUsernameRequest {
  body: { 
    token: string;
    username: string;
  }
}

class SetUsernameRequest extends Request {
  static rules() {
    return {
      token: Validator.string().required(),
      username: Validator.string().alphanum().external(unique("User", "username")).required(),
    }
  }
}

export default SetUsernameRequest;