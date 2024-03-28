import type { HttpContext } from '@adonisjs/core/http'
//import { bind } from '@adonisjs/route-model-binding'
import Contact from '#models/contact'
import ListContactResource from '#resources/v1/contact/list_contact_resource'
import ShowContactResource from '#resources/v1/contact/show_contact_resource'
import {
  listContactValidator,
  autocompleteContactSearchingValidator,
  createContactValidator,
  updateContactStatusValidator
} from '#validators/v1/contact_validator'


export default class ContactsController {
  /**
   * @index
   * @summary List all contact forms
   * @paramUse(paginatable)
   * @paramQuery q - The search query
   * @paramQuery status - The status of the contact form
   * @responseBody 200 - {"data": <Contact[]>.append("links": { "close": "xxxxx", "reopen": "xxxxx", "delete": "xxxxx" }) }
   */
  async index({ request }: HttpContext) {
    const { q, status } = await request.validateUsing(listContactValidator)
    const query = Contact.query().select('*')
    if(status) {
      query.where('status', status)
    }
    if(q) {
      log(q)
      query.search(q).rank()
    }

    const contacts = await query.paginateUsing(request)

    return ListContactResource.collection(contacts)
  }

  /**
   * @autocompleteSearch
   * @summary Autocomplete contact forms searching
   * @paramQuery q - The search query - @required
   * @paramQuery status - The status of the contact form
   * @paramQuery limit - The number of results to return - type(integer)
   * @responseBody 200 - { "data": "<Contact[]>" }
   */
  async autocompleteSearch({ request }: HttpContext) {
    const { q, status, limit = 10 } = await request.validateUsing(autocompleteContactSearchingValidator)

    const query = Contact
      .search(q)
      .rank()
      .limit(limit)
      .select('subject')
    
    if(status) {
      query.where('status', status)
    }
    return await query.pluck('subject')
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
   * @show
   * @summary Show a contact form
   * @responseBody 200 - { "data": <Contact>.append("links": { "close": "xxxxx", "reopen": "xxxxx", "delete": "xxxxx" }) }
   */
  //@bind()
  show(_: HttpContext, contact: Contact) {
    return ShowContactResource.make(contact)
  }
  

  /**
   * @delete
   * @summary Delete a contact form
   * @responseBody 204 - {}
   */
  async delete({ response, params }: HttpContext) {
    await Contact.deleteOrFail(params.id)
    response.noContent()
  }
}
