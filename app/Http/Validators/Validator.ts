import type { CustomMessages } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Config from '@ioc:Adonis/Core/Config'

export default class Validator {
  constructor(protected ctx: HttpContextContract) {
    this.ctx = ctx
  }

  public messages: CustomMessages = Config.get('validator.customMessages')
}
