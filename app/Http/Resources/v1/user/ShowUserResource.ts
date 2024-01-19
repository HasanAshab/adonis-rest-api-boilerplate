import JsonResource from "~/core/http/resources/JsonResource";
import { Request } from "~/core/express";
import { UserDocument } from "~/app/models/User";

export default class ShowUserResource extends JsonResource<UserDocument> {
  toObject(req: Request) {
    return {
      data: {
        id: this.resource._id,
        name: this.resource.name,
        username: this.resource.username,
        role: this.resource.role
      },
      links: {
        profile: this.resource.profile
      }
    }
  }
}