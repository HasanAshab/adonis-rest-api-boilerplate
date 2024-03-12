import type { HttpContext } from '@adonisjs/core/http'
import { Exception } from "@adonisjs/core/exceptions";
import string from "@adonisjs/core/helpers/string";

export default class ApiException extends Exception {
  static status = 500
  static get code() {
    return 'E_' + string.snakeCase(this.name).toUpperCase()
  }
  public headers = {}

  protected async payload() {
    return {
      errors: [{
        code: this.code,
        message: this.message,
      }],
    }
  }

  protected withHeaders(): Promise<object> | object
  protected withHeaders(ctx: HttpContext): Promise<object> | object

  protected async withHeaders(ctx?: HttpContext) {
    return this.headers
  }

  public async handle(error: this, ctx: HttpContext) {
    log(error)
    ctx.response
      .status(error.status)
      .setHeaders(await error.withHeaders(ctx))
      .send(await error.payload())
  }
}
