import { Document, LeanDocument } from "mongoose";
import ResourceCollection from "~/core/http/resources/ResourceCollection";
import JsonResource from "~/core/http/resources/JsonResource";
import CursorPaginator from "DB/plugins/Paginate/CursorPaginator";

export default class AnonymousResourceCollection extends ResourceCollection {
  constructor(resource: DocType[] | LeanDocument<DocType>[] | CursorPaginator<DocType>, collects: JsonResource<DocType>) {
    super(resource);
    this.collects = collects;
  }
}