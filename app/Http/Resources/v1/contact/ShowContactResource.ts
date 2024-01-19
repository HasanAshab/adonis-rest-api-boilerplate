import JsonResource from "~/core/http/resources/JsonResource";
import type { Request } from "~/core/express";
import type { ContactDocument } from "~/app/models/Contact";

export default abstract class ShowContactResource extends JsonResource<ContactDocument> {
  toObject(req: Request) {
    return {
      id: this.resource._id,
      email: this.resource.email,
      subject: this.resource.subject,
      message: this.resource.message,
      status: this.resource.status,
      createdAt: toHumanReadableFormat(this.resource.createdAt)
    }
  }
}
 
 