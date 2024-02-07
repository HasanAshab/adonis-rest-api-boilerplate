import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { bind } from '@adonisjs/route-model-binding'
import Contact from 'App/Models/Contact'
import CreateContactValidator from "App/Http/Validators/V1/contact/CreateContactValidator";
import SuggestContactValidator from "App/Http/Validators/V1/contact/SuggestContactValidator";
import SearchContactValidator from "App/Http/Validators/V1/contact/SearchContactValidator";
import UpdateContactStatusValidator from "App/Http/Validators/V1/contact/UpdateContactStatusValidator";
import ListContactResource from 'App/Http/Resources/v1/contact/ListContactResource'
import ShowContactResource from "App/Http/Resources/v1/contact/ShowContactResource";


export default class ContactController {
  public async index({ request }: HttpContextContract) {
    return ListContactResource.collection(
      await Contact.paginateUsing(request)
    )
  }

  public async store({ request, response }: HttpContextContract) {
    const data = await request.validate(CreateContactValidator)
    await Contact.create(data)
    response.created('Thanks for contacting us!')
  }

  public async close({ params }: HttpContextContract) {
    await Contact.updateOrFail(params.id, {
      status: 'closed'
    })
    return `Contact form closed!`
  }
  
  public async reopen({ params }: HttpContextContract) {
    await Contact.updateOrFail(params.id, {
      status: 'opened'
    })
    return `Contact form reopened!`
  }

  public async suggest({ request }: HttpContextContract) {
    const { q, status, limit = 10 } = await request.validate(SuggestContactValidator)
    
    return await Contact.search(q)
      .rank()
      .limit(limit)
      .select('subject')
      .when(status, query => {
        query.where('status', status)
      })
      .pluck('subject')
  }

  public async search({ request }: HttpContextContract) {
    const { q, status } = await request.validate(SearchContactValidator)

    const contacts = await Contact.search(q)
      .rank()
      .select('*')
      .when(status, query => {
        query.where('status', status)
      })
      .paginateUsing(request)

    return ListContactResource.collection(contacts)
  }

  @bind()
  public show(_, contact: Contact) {
    return ShowContactResource.make(contact)
  }

  public async delete({ response, params }: HttpContextContract) {
    await Contact.deleteOrFail(params.id)
    response.noContent()
  }
}
