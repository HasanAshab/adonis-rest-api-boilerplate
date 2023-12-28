import type { Document, Model } from "mongoose";
import type { MultipartFileContract } from '@ioc:Adonis/Core/BodyParser'
import type { ContentHeaders } from '@ioc:Adonis/Core/Drive'

declare module '@ioc:Adonis/Mongoose/Plugin/Attachable' {
  export * from './Attachable'
  export * from './Attachment'

  export interface IAttachment {
    name: string;
    path: string;
  }
  
  export interface AttachmentDocument extends Document, IAttachment {
    getUrl(): Promise<string>;
    getSignedUrl(options?: ContentHeaders & { expiresIn?: string | number }): Promise<string>;
  };
  
  interface AttachmentModel extends Model<AttachmentDocument> {
    fromFile(file: MultipartFileContract, tmpPath?: string): Promise<AttachmentDocument>;
  }
}