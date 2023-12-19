import { Schema, Document } from "mongoose";
import { constructor } from "types";

export interface Policy<DocType extends Document> {
  before?(doc: DocType): Promise<boolean | null> | boolean | null;
  [key: string]: (doc: DocType, targetDoc: Document) => Promise<boolean> | boolean;
}


interface HasPolicyDocument<TPolicy extends Policy<Document>> extends Document {
  can<Action extends keyof TPolicy>(action: Action, target: Parameters<Policy[Action]>[1]): Promise<boolean>;
  cannot<Action extends keyof TPolicy>(action: Action, target: Parameters<Policy[Action]>[1]): Promise<boolean>;
}


/**
 * Plugin to add access controll support to document
*/
export default function HasPolicy(schema: Schema, Policy: constructor) {
  const policy = new Policy();

  schema.methods.can = async function (action: string, target: Document) {
    const filter = await policy.before?.(this);
    return filter === null 
      ? await policy[action](this, target)
      : filter;
  };
  
  schema.methods.cannot = async function (action: string, target: Document) {
    return !await this.can(action, target);
  };
}
