import type { Schema } from "mongoose";
import Drive from '@ioc:Adonis/Core/Drive'
import { AttachmentSchema } from "@ioc:Adonis/Mongoose/Plugin/Attachable";
import { types } from '@ioc:Adonis/Core/Helpers'


export function isAttachable(schemaType: unknown | unknown[]) {
  return schemaType === AttachmentSchema || 
    (types.isArray(schemaType) && schemaType[0] === AttachmentSchema)
}

export function getAttachableFields(schema: Schema) {
  return Object.keys(schema.tree).reduce((fields: string[], fieldName) => {
    const field = schema.tree[fieldName];
    const schemaType = types.isObject(field) ? field : field.type;
    
    if(isAttachable(schemaType)) {
      fields.push(fieldName)
    }
    
    return fields;
  }, []);
}


export function Attachable(schema: Schema) {
  const attachableFields = getAttachableFields(schema);

  schema.post('init', document => {
    document.__cachedAttachments = attachableFields.reduce((attachments: Record<string, AttachmentDocument>, field) => {
      if (document._doc[field]) {
        attachments[field] = document._doc[field];
      }
      return attachments;
    }, {});
  });
  
  schema.pre('save', async function () {
    if(this.isModified('profile') && this.__cachedAttachments.profile) {
      await Drive.delete(this.__cachedAttachments.profile.path);
    }
  });
  
  schema.post('delete', async function () {
    await Drive.delete(this.profile.path);
  });
}
