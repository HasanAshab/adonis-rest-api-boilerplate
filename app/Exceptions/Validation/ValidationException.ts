import ApiException from '#app/Exceptions/ApiException'
import { reduce } from 'lodash'
import Config from '@ioc:Adonis/Core/Config'
import { CustomMessages } from "@adonisjs/validator/types";

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
          ?.replace('{{ field }}', field)
        
        if(message) {
          result.push({ field, rule, message })
        }
        else {
          result.push({ field, rule: 'custom', message: rule })
        }
        
        return result
      },
      []
    )
  }
}
