import { Request, Response } from "~/core/express";
import { Document, LeanDocument } from "mongoose";
import JsonResource from "./JsonResource";
import CursorPaginator from "~/core/database/plugins/Paginate/CursorPaginator";

export default abstract class ResourceCollection<DocType extends Document> {
  protected abstract collects: typeof JsonResource<DocType>;
  protected collection: object[];

  constructor(protected resource: DocType[] | LeanDocument<DocType>[] | CursorPaginator<DocType>) {
    this.resource = resource;
  }
  
  static make(resource: DocType[] | LeanDocument<DocType>[] | CursorPaginator<DocType>) {
    return new (this as any)(resource);
  }
  
  transform(req: Request) {
    if(this.resource instanceof CursorPaginator) {
      const paginated = this.resource.serialize--dir();
      paginated.data = this.transformCollections(req, paginated.data);
      return paginated;
    }
    this.collection = this.transformCollections(req, this.resource);
    return this.serialize--dir(req);
  }
  
  serialize--dir(req: Request) {
    return { [this.collects.wrap]: this.collection }
  }
  
  withResponse(req: Request, res: Response) {}


  private transformCollections(req: Request, collections: DocType[] | LeanDocument<DocType>[]) {
    return collections.map(resource => {
      return this.collects.make(resource).transform(req, false);
    });
  }
}