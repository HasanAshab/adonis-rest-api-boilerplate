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

export interface AttachmentMetaData {
  name: string;
  tmpDir?: string;
  path?: string;
  file?: File;
}

export default class AttachmentMeta {
  static fromFile(file: File, tmpDir?: string) {
    return new this({
      name: `${cuid()}.${file.extname}`, 
      tmpDir,
      file
    });
  }
  
  
  constructor(protected data: AttachmentMetaData) {
    this.data = data;
  }
  
  
  public get path() {
    if(!this.data.path) {
      this.resolvePath();
    }
    return this.data.path;
  }

  public moveToDisk() {
    const { file, name, tmpDir = '' } = this.data;
    
    if(!file) {
      throw new Error('attachment must have a assosiated file to save to storage.');
    }
    
    return file.moveToDisk(tmpDir, { name });
  }
  
  public delete() {
    return Drive.delete(this.path);
  }
  
  public getUrl() {
    return Drive.getUrl(this.path);
  }

  public getSignedUrl(options?: ContentHeaders & { expiresIn?: string | number }) {
    return Drive.getSignedUrl(this.path, options);
  }
  
  public toBSON() {
    return {
      name: this.data.name,
      path: this.path
    }
  }
  
  protected resolvePath() {
    this.data.path = this.data.tmpDir
      ? join(this.data.tmpDir, this.data.name)
      : this.data.name;
  }
}