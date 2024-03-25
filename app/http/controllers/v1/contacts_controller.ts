import type { HttpContext } from '@adonisjs/core/http'
import { bind } from '@adonisjs/route-model-binding'
import Contact from '#models/contact'
import ListContactResource from '#resources/v1/contact/list_contact_resource'
import ShowContactResource from '#resources/v1/contact/show_contact_resource'
import {
  createContactValidator,
  updateContactStatusValidator,
  suggestContactValidator,
  searchContactValidator,
} from '#validators/v1/contact_validator'

export default class ContactsController {
  /**
   * @index
   * @summary List all contact forms
   * @paramUse(paginatable)
   * @responseBody 200 - {"data": <Contact[]>.append("links": { "close": "xxxxx", "reopen": "xxxxx", "delete": "xxxxx" }) }
   */
  async index({ request }: HttpContext) {
    return ListContactResource.collection(await Contact.paginateUsing(request))
  }


  /**
   * @store
   * @summary Create a new contact form
   * @requestBody { "subject": "xxxxx", "message": "xxxxx", "email": "xxxxx" }
   * @responseBody 201 - { "data": <Contact> }
   */
  async store({ request, response }: HttpContext) {
    const data = await request.validateUsing(createContactValidator)
    response.created(await Contact.create(data))
  }

  
  /**
   * @updateStatus
   * @summary Update the status of a contact form
   * @responseBody 200 - { "message": "xxxxx" }
   */
  async updateStatus({ request, params }: HttpContext) {
    const { status } = await request.validateUsing(updateContactStatusValidator)
    await Contact.updateOrFail(params.id, { status })
    return `Contact form ${status}!`
  }

  
  /**
   * @suggest
   * @summary Suggest contact forms
   * @paramQuery q - The search query - @required
   * @paramQuery status - The status of the contact form
   * @paramQuery limit - The number of results to return - type(integer)
   * @responseBody 200 - { "data": <Contact[]> }
   */
  async suggest({ request }: HttpContext) {
    const { q, status, limit = 10 } = await request.validateUsing(suggestContactValidator)

    return await Contact.search(q)
      .rank()
      .limit(limit)
      .select('subject')
      .when(status, (query) => {
        query.where('status', status)
      })
      .pluck('subject')
  }


  /**
   * @search
   * @summary Search contact forms
   * @paramQuery q - The search query - @required
   * @paramQuery status - The status of the contact form
   * @paramUse(paginatable)
   * @responseBody 200 - { "data": <Contact[]> }
   */
  async search({ request }: HttpContext) {
    const { q, status } = await request.validateUsing(searchContactValidator)

    const contacts = await Contact.search(q)
      .rank()
      .select('*')
      .when(status, (query) => {
        query.where('status', status)
      })
      .paginateUsing(request)

    return ListContactResource.collection(contacts)
  }


  /**
   * @show
   * @summary Show a contact form
   * @responseBody 200 - { "data": <Contact>.append("links": { "close": "xxxxx", "reopen": "xxxxx", "delete": "xxxxx" }) }
   */
  @bind()
  show(_: HttpContext, contact: Contact) {
    return ShowContactResource.make(contact)
  }
  

  /**
   * @delete
   * @summary Delete a contact form
   * @responseBody 204
   */
  async delete({ response, params }: HttpContext) {
    await Contact.deleteOrFail(params.id)
    response.noContent()
  }
}
