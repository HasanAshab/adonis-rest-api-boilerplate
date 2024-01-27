import { AuthenticRequest } from "~/core/express";
import Validator, { unique } from "Validator";
import { UploadedFile } from "express-fileupload";

interface UpdateProfileRequest {
  body: { 
    name?: string;
    username?: string;
    email?: string;
  };
  
  files: {
    profile?: UploadedFile
  }
}

class UpdateProfileRequest extends AuthenticRequest {
  static rules() {
    return {
      name: Validator.string().min(3).max(25).sanitize(),
      username: Validator.string().alphanum().min(3).max(12).external(unique("User", "username")),
      email: Validator.string().email().external(unique("User", "email")),
      profile: Validator.file().parts(1).max(1000*1000).mimetypes(["image/jpeg", "image/png"])
    }
  }
}

export default UpdateProfileRequest;