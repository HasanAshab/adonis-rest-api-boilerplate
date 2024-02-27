import type { HttpContext } from '@adonisjs/core/http'
import Config from '@ioc:adonis/core/config'
import { CustomMessages } from "@adonisjs/validator/types";

export default class Validator {
  constructor(protected ctx: HttpContext) {
    this.ctx = ctx
  }

  public messages: CustomMessages = Config.get('validator.customMessages')
}
