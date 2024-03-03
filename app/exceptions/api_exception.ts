import type { HttpContext } from '@adonisjs/core/http'
import { Exception } from "@adonisjs/core/exceptions";
import { string } from "@adonisjs/core/helpers/string";

export default abstract class ApiException extends Exception {
  public abstract status: number
  public abstract message: string
  public headers = {}

  constructor() {
    super('')
  }

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

  public get code() {
    return 'E_' + string.snakeCase(this.name).toUpperCase()
  }

  public async handle(error: this, ctx: HttpContext) {
    ctx.response
      .status(error.status)
      .setHeaders(await error.withHeaders(ctx))
      .send(await error.payload())
  }
}
