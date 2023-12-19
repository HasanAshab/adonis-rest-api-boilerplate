import { Schema, Document } from "mongoose";
import { formatDistanceToNow } from 'date-fns';

export default (schema: Schema, fields = ["createdAt", "updatedAt"]) => {
  schema.set('toJSON', {
    transform(doc, ret, options) {
      for(const field of fields){
        ret[field] = formatDistanceToNow(ret[field], { addSuffix: true }).replace("about ", "");
      }
      return ret;
    },
  });
}