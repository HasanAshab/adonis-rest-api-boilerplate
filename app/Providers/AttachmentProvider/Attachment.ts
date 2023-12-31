import { SchemaType } from "mongoose"
import { File } from '@adonisjs/bodyparser/build/src/Multipart/File'
import AttachmentMeta from './AttachmentMeta'


export default class Attachment extends SchemaType {
  //key ar options re kaje laga
  constructor(key, options) {
    super(key, options, 'Attachment');
  }

  cast(value: unknown) {
    if(value instanceof AttachmentMeta) {
      return value;
    }
    
    if(value.name && value.path) {
      return new AttachmentMeta({
        name: value.name,
        path: value.path
      });
    }

    if(value instanceof File) {
      return AttachmentMeta.fromFile(value);
    }
    
    throw new Error();
  }
}