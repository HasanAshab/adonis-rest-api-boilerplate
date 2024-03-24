import ApiException from '#exceptions/api_exception'
import { reduce } from 'lodash-es'
import config from '@adonisjs/core/services/config'
import { CustomMessages } from '@adonisjs/validator/types'

type RuleName = keyof CustomMessages

export default class ValidationException extends ApiException {
  static status = 422

  constructor(public fieldsWithRule: Record<string, RuleName> = {}) {
    super('')
  }

  static field(name: string, rule: RuleName) {
    return new this({
      [name]: rule,
    })
  }

  payload() {
    return {
      errors: this.makeValidationErrors(),
    }
  }

  private makeValidationErrors() {
    return reduce(
      this.fieldsWithRule,
      (result, rule, field) => {
        const message = config
          .get('validator.customMessages.' + rule)
          ?.replace('{{ field }}', field)

        if (message) {
          result.push({ field, rule, message })
        } else {
          result.push({ field, rule: 'custom', message: rule })
        }

        return result
      },
      []
    )
  }
}
