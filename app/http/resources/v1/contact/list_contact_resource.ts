import BaseJsonResource from '#resources/base_json_resource'
import Contact from '#models/contact'
import string from '@adonisjs/core/helpers/string'


export default class ListContactResource extends BaseJsonResource<Contact> {
  serialize() {
    return {
      id: this.resource.id,
      email: this.resource.email,
      subject: this.resource.subject,
      message: string.truncate(this.resource.message, 30),
      status: this.resource.status,
      createdAt: this.resource.createdAt.toRelative(),
      links: {
        self: this.makeUrl('v1.contact.show'),
        updateStatus: this.makeUrl('v1.contact.update.status'),
        delete: this.makeUrl('v1.contact.delete'),
      },
    }
  }
}
