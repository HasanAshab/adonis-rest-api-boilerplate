import { Request, Response } from "~/core/express";
import { Document, LeanDocument } from "mongoose";
import CursorPaginator from "DB/plugins/Paginate/CursorPaginator";
import AnonymousResourceCollection from "./AnonymousResourceCollection";

export default abstract class JsonResource<DocType extends Document> {
  static wrap = "data";
  
  constructor(protected readonly resource: DocType | LeanDocument<DocType>) {
    this.resource = resource;
  }
  
  static make(resource: DocType | LeanDocument<DocType>) {
    return new this(resource);
  }
  
  static collection(resource: DocType[] | LeanDocument<DocType>[] | CursorPaginator<DocType>) {
    return new AnonymousResourceCollection(resource, this);
  }
  
  transform(req: Request, isRoot = true) {
    return isRoot 
      ? { [this.constructor.wrap]: this.toObject(req) }
      : this.toObject(req);
  }
  
  public abstract toObject(req: Request): object; 
  
  withResponse(req: Request, res: Response) {}

  
  protected when(condition: boolean, value: unknown) {
    if(!condition)
      return undefined;
    if(typeof value === "function") {
      value = value();
    }
    return value;
  }
}
