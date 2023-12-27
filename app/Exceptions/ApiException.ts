import { Exception } from '@adonisjs/core/build/standalone'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class ApiException extends Exception {
  abstract status: number;
  abstract message: string;
  
  headers = {};
  withHeaders(): Promise<object> | object;
  withHeaders(ctx: HttpContextContract): Promise<object> | object;
  
  async withHeaders(...args: any[]) {
    return this.headers;
  }

  async handle(error: this, ctx: HttpContextContract) {
    ctx.response
      .status(error.status)
      .setHeaders(await error.withHeaders(ctx))
      .message(error.message);
  }
}