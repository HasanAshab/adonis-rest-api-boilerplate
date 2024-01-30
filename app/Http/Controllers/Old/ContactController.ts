import Controller from "~/app/http/controllers/Controller";
import { RequestHandler } from "~/core/decorators";
import { AuthenticRequest, Response } from "~/core/express";
import Contact, { IContact } from "~/app/models/Contact";
import Cache from "Cache";
import ContactRequest from "~/app/http/requests/v1/contact/ContactRequest";
import SuggestContactRequest from "~/app/http/requests/v1/contact/SuggestContactRequest";
import SearchContactRequest from "~/app/http/requests/v1/contact/SearchContactRequest";
import UpdateContactStatusRequest from "~/app/http/requests/v1/contact/UpdateContactStatusRequest";
import ListContactResource from "~/app/http/resources/v1/contact/ListContactResource";
import ShowContactResource from "~/app/http/resources/v1/contact/ShowContactResource";

export default class ContactController extends Controller {
  @RequestHandler
  async index(req: AuthenticRequest) {
    return ListContactResource.collection(
      //await Contact.paginateCursor(req).lean()
      await Contact.find().lean().paginateCursor(req)
    );
  }
  
  @RequestHandler
  async store(req: ContactRequest, res: Response) {
    await Contact.create(req.body);
    res.status(201).message("Thanks for contacting us!");
  }
  
  @RequestHandler
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
  
  @RequestHandler
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
  
  @RequestHandler
  async show(rawContact: IContact) {
    return ShowContactResource.make(rawContact);
  }
  
  @RequestHandler
  async delete(res: Response, id: string) {
    await Contact.deleteByIdOrFail(id);
    res.sendStatus(204);
  }

  @RequestHandler
  async updateStatus(req: UpdateContactStatusRequest, id: string) {
    await Contact.updateByIdOrFail(id, req.body);
    return `Contact form ${req.body.status}!`;
  }
}

