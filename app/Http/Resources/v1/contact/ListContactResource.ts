//import JsonResource from "@samer/api-resource/resources/json_resource";
import { string } from '@ioc:Adonis/Core/Helpers'

export default class ListContactResource extends JsonResource {
  public serialize() {
    return {
      id: this.resource.id,
      email: this.resource.email,
      subject: this.resource.subject,
      message: string.truncate(this.resource.message, 30),
      status: this.resource.status,
      createdAt: this.resource.createdAt.toRelative(),
      links: {
        self: this.makeUrl('v1.contact.show'),
        close: this.when(this.resource.isOpened(), () => {
          return this.makeUrl('v1.contact.close')
        }),
        reopen: this.when(this.resource.isClosed(), () => {
          return this.makeUrl('v1.contact.reopen')
        }),
        delete: this.makeUrl('v1.contact.delete'),
      },
    }
  }
}
