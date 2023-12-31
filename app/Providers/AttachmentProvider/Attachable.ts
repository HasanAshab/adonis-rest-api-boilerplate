import type { Schema } from "mongoose";
import Drive from '@ioc:Adonis/Core/Drive'
import Attachment from "./Attachment";
import { File } from '@adonisjs/bodyparser/build/src/Multipart/File'
import { types } from '@ioc:Adonis/Core/Helpers'


export function isAttachable(schemaType: unknown | unknown[]) {
  return schemaType === Attachment || 
    (types.isArray(schemaType) && schemaType[0] === Attachment)
}


export function getAttachableFields(schema: Schema) {
  return Object.keys(schema.tree).reduce((fields: string[], fieldName) => {
    const field = schema.tree[fieldName];
    const schemaType = types.isObject(field) ? field.type : field;
    if(isAttachable(schemaType)) {
      fields.push(fieldName)
    }
    
    return fields;
  }, []);
}


export function Attachable(schema: Schema) {
  const attachableFields = getAttachableFields(schema);

  schema.post(['init', 'save'], document => {
    document.cacheAttachments();
  });


  schema.pre('save', async function () {
    if(this.isModified('profile')) {
      await this.profile?.moveToDisk();
      await this.__cachedAttachments.profile?.delete();
    }
  });
  
  schema.post('delete', async function () {
    await this.profile.delete();
  });
  
  
  schema.method('cacheAttachments', function() {
    this.__cachedAttachments = attachableFields.reduce((attachments: Record<string, AttachmentDocument>, field) => {
      if (this._doc[field]) {
        attachments[field] = this._doc[field];
      }
      return attachments;
    }, {});
  });
}
