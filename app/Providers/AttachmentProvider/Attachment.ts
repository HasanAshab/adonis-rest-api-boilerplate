import { SchemaType } from "mongoose"
import { File } from '@adonisjs/bodyparser/build/src/Multipart/File'
import AttachmentMeta from './AttachmentMeta'


import type { MultipartFileContract } from '@ioc:Adonis/Core/BodyParser'
import type { AttachmentDocument, AttachmentModel } from '@ioc:Adonis/Mongoose/Plugin/Attachable'
import Drive, { ContentHeaders } from '@ioc:Adonis/Core/Drive'
import { model, Schema } from "mongoose";
import { join } from "path";
import { cuid } from '@poppinss/utils/build/helpers'

/*
export const AttachmentSchema = new Schema<AttachmentDocument>(
  {
    name: {
      required: true,
      type: String
    },
    path: {
      required: true,
      type: String
    }
  },
  { _id: false }
);


AttachmentSchema.static("fromFile", function(file: MultipartFileContract, tmpDir = '') {
  const name = `${cuid()}.${file.extname}`;
  const attachment = new this({
    name,
    path: join(tmpDir, name)
  });

  attachment._data = {
    file,
    tmpDir
  }
  
  return attachment;
});

AttachmentSchema.method("getUrl", function() {
  return Drive.getUrl(this.path);
});

AttachmentSchema.method("getSignedUrl", function(options?: ContentHeaders & { expiresIn?: string | number }) {
  return Drive.getSignedUrl(this.path, options);
});


AttachmentSchema.method("moveFileToDisk", async function() {
  if(this._data) {
    await this._data.file.moveToDisk(this._data.tmpDir, { name: this.name });
  }
});

AttachmentSchema.method("deleteFile", function() {
  return Drive.delete(this.path);
});



export const AttachmentModel = model<AttachmentDocument, AttachmentModel>("Attachment", AttachmentSchema);
*/

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