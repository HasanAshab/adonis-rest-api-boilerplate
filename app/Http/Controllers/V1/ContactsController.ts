import type { HttpContext } from '@adonisjs/core/http'
import { bind } from '@adonisjs/route-model-binding'
import Contact from '#app/Models/Contact'
import CreateContactValidator from '#app/Http/Validators/V1/contact/CreateContactValidator'
import UpdateContactStatusValidator from '#app/Http/Validators/V1/contact/UpdateContactStatusValidator'
import SuggestContactValidator from '#app/Http/Validators/V1/contact/SuggestContactValidator'
import SearchContactValidator from '#app/Http/Validators/V1/contact/SearchContactValidator'
import ListContactResource from '#app/Http/Resources/v1/contact/ListContactResource'
import ShowContactResource from '#app/Http/Resources/v1/contact/ShowContactResource'

export default class ContactsController {
  public async index({ request }: HttpContext) {
    return ListContactResource.collection(await Contact.paginateUsing(request))
  }

  public async store({ request, response }: HttpContext) {
    const data = await request.validate(CreateContactValidator)
    response.created(await Contact.create(data))
  }

  public async updateStatus({ request, params }: HttpContext) {
    const { status } = await request.validate(UpdateContactStatusValidator)
    await Contact.updateOrFail(params.id, { status })
    return `Contact form ${status}!`
  }

  public async suggest({ request }: HttpContext) {
    const { q, status, limit = 10 } = await request.validate(SuggestContactValidator)

    return await Contact.search(q)
      .rank()
      .limit(limit)
      .select('subject')
      .when(status, (query) => {
        query.where('status', status)
      })
      .pluck('subject')
  }

  public async search({ request }: HttpContext) {
    const { q, status } = await request.validate(SearchContactValidator)

    const contacts = await Contact.search(q)
      .rank()
      .select('*')
      .when(status, (query) => {
        query.where('status', status)
      })
      .paginateUsing(request)

    return ListContactResource.collection(contacts)
  }

  @bind()
  public show(_, contact: Contact) {
    return ShowContactResource.make(contact)
  }

  public async delete({ response, params }: HttpContext) {
    await Contact.deleteOrFail(params.id)
    response.noContent()
  }
}
