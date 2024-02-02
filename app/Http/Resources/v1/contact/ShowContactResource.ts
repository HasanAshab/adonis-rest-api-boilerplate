import JsonResource from '@samer/api-resource/resources/json_resource'
import type { Request } from '~/core/express'
import type { ContactDocument } from '~/app/models/Contact'

export default abstract class ShowContactResource extends JsonResource<ContactDocument> {
  serialize() {
    return {
      id: this.resource._id,
      email: this.resource.email,
      subject: this.resource.subject,
      message: this.resource.message,
      status: this.resource.status,
      createdAt: toHumanReadableFormat(this.resource.createdAt),
    }
  }
}
