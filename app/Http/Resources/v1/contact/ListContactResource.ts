import JsonResource from "~/core/http/resources/JsonResource";
import type { Request } from "~/core/express";
import type { ContactDocument } from "~/app/models/Contact";

export default abstract class ListContactResource extends JsonResource<ContactDocument> {
  toObject(req: Request) {
    return {
      id: this.resource._id,
      email: this.resource.email,
      subject: this.resource.subject,
      message: this.resource.message.substring(0, 30),
      status: this.resource.status,
      createdAt: toHumanReadableFormat(this.resource.createdAt)
    }
  }
}
 