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

  handle(error: this, { response }: HttpContextContract) {
    response
      .status(error.status)
      .headers(await error.withHeaders(ctx))
      .message(error.message);
  }
}