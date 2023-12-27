import type { ApplicationContract } from '@ioc:Adonis/Core/Application'
import { getStatusText } from "http-status-codes";


// import { Router as BaseRouter } from '@adonisjs/http-server/build/standalone'
// import Env from '@ioc:Adonis/Core/Env'
// import { hostname } from "os"
// 
// class Router extends BaseRouter {
//   makeFullUrl(...args) {
//     const path = this.makeUrl(...args);
//     return `https://${hostname()}:${Env.get('PORT')}${path}`;
//   }
// }
// 


export default class AppProvider {
  constructor (protected app: ApplicationContract) {}


  public async boot () {
    this.addResponseHelpers();
  }
  
  private addResponseHelpers() {
    const Response = this.app.container.use('Adonis/Core/Response')

    Response.getter('isSuccessful', function () {
      return this.response.statusCode >= 200 && this.response.statusCode < 300;
    });
    
    Response.getter('standardMessage', function () {
      return getStatusText(this.response.statusCode);
    });
    
    Response.macro('api', function (data: object | any[]) {
      if(Array.isArray(data)) {
        return this.send({
          success: this.isSuccessful,
          message: this.standardMessage,
          data
        });
      }
      
      if(!data.success) {
        data.success = this.isSuccessful;
      }
      
      if(!data.message) {
        data.message = this.standardMessage;
      }
      
      return this.send(data);
    });
    
    Response.macro('message', function (text?: string) {
      this.send({
        success: this.isSuccessful,
        message: text || this.standardMessage,
      });
      return this;
    });
    
    Response.macro('sendStatus', function (code: number) {
      this.status(code).api({});
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
