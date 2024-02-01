import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { bind } from '@adonisjs/route-model-binding'
import Contact from "App/Models/Contact";
//import Cache from "Cache";
//import ContactRequest from "App/Http/requests/v1/contact/ContactRequest";
//import SuggestContactRequest from "App/Http/requests/v1/contact/SuggestContactRequest";
//import SearchContactRequest from "App/Http/requests/v1/contact/SearchContactRequest";
//import UpdateContactStatusValidator from "App/Http/Validators/V1/contact/UpdateContactStatusValidator";
import ListContactResource from "App/Http/Resources/v1/contact/ListContactResource";
//import ShowContactResource from "App/Http/Resources/v1/contact/ShowContactResource";

export default class ContactController {
  public async index({ request }: HttpContextContract) {
    return ListContactResource.collection(
      await Contact.query().pojo().paginateUsing(request)
    );
  }
  
  public async store({ request, response }: HttpContextContract) {
    const data = await request.validate(CreateContactValidator);
    await Contact.create(data);
    response.created("Thanks for contacting us!");
  }
  
  public async updateStatus({ request, params }: HttpContextContract) {
    const data = await request.validate(UpdateContactStatusValidator);
    await Contact.updateOrFail(params.id, data);
    return `Contact form ${data.status}!`;
  }

  async suggest(req: SuggestContactRequest, res: Response) {
    const { q, status, limit } = req.query;
    const cacheKey = `contacts.suggest:${q},${status},${limit}`;
 /*   
    const qq = Contact.search(q).limit(limit).select("subject").select("message").when(status, query => {
        query.where("status").equals(status);
      });
   // qq._fields["score"] = 0
    
    log(qq)
    return await qq*/
    const results = await Cache.rememberSerialized(cacheKey, 5 * 60 * 60, () => {
      return Contact.search(q).limit(limit).select("-_id +score subject").when(status, query => {
        query.where("status").equals(status);
      });
    });

    res.json(results);
  }
  
  async search(req: SearchContactRequest, res: Response) {
    const { q, status, limit, cursor } = req.query;
    const cacheKey = `contacts.search:${q},${status},${limit},${cursor}`;
    
    const results = await Cache.rememberSerialized(cacheKey, 5 * 60 * 60, () => {
      return Contact.search(q).when(status, query => {
        query.where("status").equals(status);
      }).paginateCursor(req);
    });
    
    res.json(results);
  }
  
  @bind()
  public show(_, contact: Contact) {
    return ShowContactResource.make(contact);
  }
  
  public async delete({ response, params }: HttpContextContract) {
    await Contact.deleteOrFail(params.id);
    response.noContent();
  }
}

