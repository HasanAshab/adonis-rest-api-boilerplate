import JsonResource from "~/core/http/resources/JsonResource";
import { Request } from "~/core/express";
import { UserDocument } from "~/app/models/User";

export default class ListUserResource extends JsonResource<UserDocument> {
  toObject(req: Request) {
    return {
      data: {
        id: this.resource._id,
        username: this.resource.username,
      },
      links: {
        profile: this.resource.profile
      }
    }
  }
}