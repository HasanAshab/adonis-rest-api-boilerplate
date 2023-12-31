import { SchemaType } from "mongoose"
import { File } from '@adonisjs/bodyparser/build/src/Multipart/File'
import AttachmentMeta from './AttachmentMeta'



import type { MultipartFileContract } from '@ioc:Adonis/Core/BodyParser'
import type { AttachmentDocument, AttachmentModel } from '@ioc:Adonis/Mongoose/Plugin/Attachable'
import Drive, { ContentHeaders } from '@ioc:Adonis/Core/Drive'
import { model, Schema } from "mongoose";
import { join } from "path";

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


AttachmentSchema.static("fromFile", async function(file: MultipartFileContract, tmpPath = '') {
  await file.moveToDisk(tmpPath);
  return new this({
    name: file.fileName,
    path: join(tmpPath, file.fileName)
  });
});

AttachmentSchema.method("getUrl", function() {
  return Drive.getUrl(this.path);
});

AttachmentSchema.method("getSignedUrl", function(options?: ContentHeaders & { expiresIn?: string | number }) {
  return Drive.getSignedUrl(this.path, options);
});



export const AttachmentModel = model<AttachmentDocument, AttachmentModel>("Attachment", AttachmentSchema);



export default class Attachment extends SchemaType {
  //key ar options re kaje laga
  constructor(key, options) {
    super(key, options, 'Attachment');
  }

  cast(value: unknown) {
    if(value instanceof AttachmentModel) {
      return value;
    }

    if(value instanceof File) {
      return AttachmentModel.fromFile(value);
    }
    
    throw new Error();
  }
  
}