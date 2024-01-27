import { AuthenticRequest } from "~/core/express";
import Validator, { unique } from "Validator";
import { UploadedFile } from "express-fileupload";

interface CategoryRequest {
  body: {
    name: string;
    slug: string;
  }
  
  files: {
    icon: UploadedFile;
  }
}

class CategoryRequest extends AuthenticRequest {
  static rules() {
    return {
      name: Validator.string().required(),
      slug: Validator.string().slug().external(unique("Category", "slug")).required(),
      icon: Validator.file().parts(1).max(1000*1000).mimetypes(["image/jpeg", "image/png"]).required(),
    }
  }
}

export default CategoryRequest;