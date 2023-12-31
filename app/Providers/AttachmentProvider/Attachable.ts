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
  schema.virtual('attachableFields').get(function() {
    if(!this.__attachableFields) {
      this.__attachableFields = getAttachableFields(schema);
    }
    return this.__attachableFields;
  });
  
  
  schema.virtual('modifiedAttachableFields').get(function() {
    return this.attachableFields.filter(field => this.isModified(field));
  });
  

  schema.post(['init', 'save'], document => {
    document.cacheAttachments();
  });


  schema.pre('save', async function () {
    this.modifiedAttachableFields.forEach(field => {
      this._doc[field]?.moveToDisk();
      this.__cachedAttachments?.[field]?.delete();
    });
  });
  
  
  schema.post('delete', async function () {
    this.attachableFields.forEach(field => {
      this._doc[field]?.delete();
    });
  });
  
  
  schema.method('cacheAttachments', function() {
    this.__cachedAttachments = this.attachableFields.reduce((attachments: Record<string, AttachmentDocument>, field) => {
      if (this._doc[field]) {
        attachments[field] = this._doc[field];
      }
      return attachments;
    }, {});
  });
}
