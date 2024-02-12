import ApiException from 'App/Exceptions/ApiException'
import type { CustomMessages } from '@ioc:Adonis/Core/Validator'
import { reduce } from 'lodash'
import Config from '@ioc:Adonis/Core/Config'

type RuleName = keyof CustomMessages

export default class ValidationException extends ApiException {
  public status = 422

  constructor(public fieldsWithRule: Record<string, RuleName> = {}) {
    super()
  }

  static field(name: string, rule: RuleName) {
    return new this({
      [name]: rule,
    })
  }

  public payload() {
    return {
      errors: this.makeValidationErrors(),
    }
  }

  private makeValidationErrors() {
    return reduce(
      this.fieldsWithRule,
      (result, rule, field) => {
        const message = Config
          .get('validator.customMessages.' + rule)
          .replace('{{ field }}', field)
          
        result.push({ field, rule, message })
        return result
      },
      []
    )
  }
}
