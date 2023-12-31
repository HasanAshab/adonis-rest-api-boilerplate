import type { Document, Model } from "mongoose";
import type { MultipartFileContract } from '@ioc:Adonis/Core/BodyParser'
import type { ContentHeaders } from '@ioc:Adonis/Core/Drive'

declare module '@ioc:Adonis/Mongoose/Plugin/Attachable' {
  export * from './Attachable'
  export { default as Attachment } from './Attachment'
  export { default as AttachmentMeta } from './AttachmentMeta'
}