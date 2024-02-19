import { Exception } from '@adonisjs/core/build/standalone'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { string } from '@ioc:Adonis/Core/Helpers'

export default abstract class ApiException extends Exception {
  public abstract status: number
  public abstract message: string
  public headers = {}

  constructor() {
    super('')
  }

  protected async payload() {
    return {
      errors: [
        {
          code: this.code,
          message: this.message,
        },
      ],
    }
  }

  protected withHeaders(): Promise<object> | object
  protected withHeaders(ctx: HttpContextContract): Promise<object> | object

  protected async withHeaders(ctx?: HttpContextContract) {
    return this.headers
  }

  public get code() {
    return 'E_' + string.snakeCase(this.name).toUpperCase()
  }

  public async handle(error: this, ctx: HttpContextContract) {
    ctx.response
      .status(error.status)
      .setHeaders(await error.withHeaders(ctx))
      .send(await error.payload())
  }
}
