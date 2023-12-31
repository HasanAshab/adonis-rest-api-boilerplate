import Drive, { ContentHeaders } from '@ioc:Adonis/Core/Drive'
import { File } from '@adonisjs/bodyparser/build/src/Multipart/File'
import { cuid } from '@poppinss/utils/build/helpers'
import { join } from "path"

/*
export default class AttachmentMeta {
  public name: string;
  public path: string;
  
  constructor(public file: File, public tmpDir = '') {
    this.file = file;
    this.name = `${cuid()}.${file.extname}`;
    this.tmpDir = tmpDir;
    this.path = join(tmpDir, this.name);
  }
  

  moveToDisk() {
    return this.file.moveToDisk(this.tmpDir, { name: this.name });
  }
  
  delete() {
    return Drive.delete(this.file.path);
  }
  
  getUrl() {
    return Drive.getUrl(this.path);
  }

  getSignedUrl(options?: ContentHeaders & { expiresIn?: string | number }) {
    return Drive.getSignedUrl(this.path, options);
  }
  
  toJSON() {
    return {
      name: this.name,
      path: this.path
    }
  }
}
*/
export default class AttachmentMeta {
  public name: string;
  public path: string;
  
  constructor(public file: File, public tmpDir = '') {
    this.file = file;
    this.name = `${cuid()}.${file.extname}`;
    this.tmpDir = tmpDir;
    this.path = join(tmpDir, this.name);
  }
  

  moveToDisk() {
    return this.file.moveToDisk(this.tmpDir, { name: this.name });
  }
  
  delete() {
    return Drive.delete(this.file.path);
  }
  
  getUrl() {
    return Drive.getUrl(this.path);
  }

  getSignedUrl(options?: ContentHeaders & { expiresIn?: string | number }) {
    return Drive.getSignedUrl(this.path, options);
  }
  
  toJSON() {
    return {
      name: this.name,
      path: this.path
    }
  }
}