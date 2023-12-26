import type { ApplicationContract } from '@ioc:Adonis/Core/Application'
import { getStatusText } from "http-status-codes";

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
    });
    
    Response.macro('sendStatus', function (code: number) {
      this.status(code).api({});
    });
  }
}
