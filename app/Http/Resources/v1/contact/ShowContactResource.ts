//import JsonResource from '@samer/api-resource/resources/json_resource'
import type { Request } from '~/core/express'
import type { ContactDocument } from '~/app/models/Contact'

export default class ShowContactResource extends JsonResource<ContactDocument> {
  public serialize() {
    return {
      id: this.resource.id,
      email: this.resource.email,
      subject: this.resource.subject,
      message: this.resource.message,
      status: this.resource.status,
      createdAt: this.resource.createdAt.toRelative(),
      links: {
        close: this.when(this.resource.isOpened(), () => {
          return this.makeUrl('v1.contact.close')
        }),
        reopen: this.when(this.resource.isClosed(), () => {
          return this.makeUrl('v1.contact.reopen')
        }),
        delete: this.makeUrl('v1.contact.delete')
      }
    }
  }
}
