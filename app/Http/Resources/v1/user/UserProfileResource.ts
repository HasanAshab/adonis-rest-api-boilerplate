//import JsonResource from '@samer/api-resource/resources/json_resource'
import { Request } from '~/core/express'
import { UserDocument } from '~/app/models/User'

export default class UserProfileResource extends JsonResource<UserDocument> {
  serialize() {
    return {
      data: {
        id: this.resource.id,
        name: this.resource.name,
        username: this.resource.username,
        email: this.resource.email,
        phoneNumber: this.resource.phoneNumber,
        username: this.resource.username,
        role: this.resource.role,
      },
      links: {
        avatar: this.resource.avatarUrl(),
      },
    }
  }
}
