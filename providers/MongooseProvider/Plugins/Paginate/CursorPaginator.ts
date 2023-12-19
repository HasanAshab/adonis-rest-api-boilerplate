import { Request } from "express";
import { Document, LeanDocument } from "mongoose";
import { last } from "lodash";

export default class CursorPaginator<DocType extends Document> {
  constructor(protected req: Request, protected items: DocType[] | LeanDocument<DocType>[], protected cursor?: string) {
    this.req = req;
    this.items = items;
    this.cursor = cursor;
  }
  
  static getCursorOf(item: Document | LeanDocument) {
    return item._id.toHexString();
  }
  
  get nextCursor() {
    return this.items.length 
      ? CursorPaginator.getCursorOf(last(this.items))
      : null;
  }
  
  get nextPageUrl() {
    if(!this.nextCursor)
      return null;
    const query = new URLSearchParams(this.req.query);
    query.set("cursor", this.nextCursor);
    return `${this.req.fullPath}?${query.toString()}`;
  }

  toObject() {
    return {
      data: this.items,
      links: {
        nextPage: this.nextPageUrl
      },
      meta: {
        path: this.req.fullPath,
        perPage: this.items.length,
        nextCursor: this.nextCursor
      }
    }
  }
  
  toJSON() {
    return this.toObject();
  }
}
