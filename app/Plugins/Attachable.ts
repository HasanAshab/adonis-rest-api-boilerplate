import { Schema, Document, Query } from "mongoose";
import { constructor } from "types";

{
      name: this.name,
      extname: this.extname,
      size: this.size,
      mimeType: this.mimeType,
    }
//url ki Att save kore kina | na
interface AttachableDocument extends Document {
 // search(query: string): Query;
}

export default function Attachable(schema: Schema) {
  schema.methods.attach = function(field: string, file: MultipartFileContract) {
    //...field validation
    this[field] = 
  };
  
}
