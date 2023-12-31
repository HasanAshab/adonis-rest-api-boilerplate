import type { Schema } from "mongoose";
import Drive from '@ioc:Adonis/Core/Drive'
import { AttachmentSchema } from "@ioc:Adonis/Mongoose/Plugin/Attachable";
import { File } from '@adonisjs/bodyparser/build/src/Multipart/File'
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

  schema.post('save', document => {
    document.__cachedAttachments = attachableFields.reduce((attachments: Record<string, AttachmentDocument>, field) => {
      if (document._doc[field]) {
        attachments[field] = document._doc[field];
      }
      return attachments;
    }, {});
  });
  
  schema.pre('save', async function () {
    if(this.isModified('profile')) {
      if(this.profile) {
        await this.profile.moveToDisk();
      //  console.log(this.set.toString())
      //  this.set('profile', this.profile.toJSON());
       //   console.trace(this)

      //  this.markModified('profile');
      }
      await this.__cachedAttachments.profile?.delete();
    }
  });
  
  schema.post('delete', async function () {
    await this.profile.delete();
  });
}
