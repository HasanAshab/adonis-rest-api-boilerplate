import type { ApplicationContract } from '@ioc:Adonis/Core/Application'
import { getStatusText } from "http-status-codes";

import fs from 'fs'
import path from 'path'
import Application from '@ioc:Adonis/Core/Application'

export default class AppProvider {
  constructor(protected app: ApplicationContract) {}

  public async boot() {
    this.addResponseHelpers();
    
    const Router = this.app.container.use('Adonis/Core/Route')
   /* 
   Router.discover = function(directoryPath: string) {
      const absolutePath = Application.makePath(directoryPath);
      const files = fs.readdirSync(absolutePath)
      console.log(files)
      files.forEach((file) => {
        const fullPath = path.join(directoryPath, file)
        const stat = fs.lstatSync(path.join(absolutePath, file))
        
        if (stat.isDirectory()) {
          this.discover(fullPath);
        }
        
        else if (stat.isFile() && path.extname(file) === '.ts') {
          const routePrefix = path.basename(file, '.ts');
          this.group(() => require(absolutePath)).prefix(routePrefix);
        }
      })
    }*/
    Router.discover = function(base: string) {
      const stack = [base];
      while (stack.length > 0) {
        const currentPath = stack.pop();
        if (!currentPath) break;
        const items = fs.readdirSync(currentPath);
        for (const item of items) {
          const itemPath = path.join(currentPath, item);

          const status = fs.statSync(itemPath);
          if (status.isFile()) {
            const itemPathEndpoint = itemPath.replace(base, "").split(".")[0].toLowerCase().replace(/index$/, "");
                                  console.log(itemPathEndpoint)

            const routerPath =  Application.makePath(itemPath.split(".")[0]);
            this.group(() => require(routerPath)).prefix(itemPathEndpoint);
          }
          else if (status.isDirectory()) {
            stack.push(itemPath);
          }
        }
      }
    }
  }
  
  
  private addResponseHelpers() {
    const Response = this.app.container.use('Adonis/Core/Response');
    const { types } = this.app.container.use('Adonis/Core/Helpers');

    Response.getter('isSuccessful', function () {
      return this.response.statusCode >= 200 && this.response.statusCode < 300;
    });
    
    Response.getter('standardMessage', function () {
      return getStatusText(this.response.statusCode);
    });
    
    Response.macro('sendOriginal', Response.prototype.send);
   /* Response.macro('sendOriginal', function (body = {}, generateEtag = this.config.etag) {
      this.writerMethod = 'writeBody';
      this.hasLazyBody = true;
      this.lazyBody = [body, generateEtag];
    });*/
    
    Response.macro('send', function (body: null | string | object | any[] = {}, generateEtag = this.config.etag) {
      const acceptsJson = this.request.headers.accept === 'application/json';
      
      if(acceptsJson) {
        if(types.isNull(body)) {
          body = {}
        }
        
        else if(types.isString(body)) {
          body = { message: body };
        }
        
        else if(types.isArray(body)) {
          body = { data: body };
        }
        
        if(!body.success) {
          body.success = this.isSuccessful;
        }
        
        if(!body.message) {
          body.message = this.standardMessage;
        }
      }
      
      return this.sendOriginal(body, generateEtag);
    });

    Response.macro('sendStatus', function (code: number) {
      this.status(code).send({});
      return this;
    });
    
    Response.macro('setHeaders', function (data: object) {
      for(const key in data) {
        this.header(key, data[key]);
      }
      return this;
    });
    
    Response.macro('safeHeaders', function (data: object) {
      for(const key in data) {
        this.safeHeader(key, data[key]);
      }
      return this;
    });
  }
}
