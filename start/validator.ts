import { validator } from '@ioc:Adonis/Core/Validator'
import { PasswordStrategy } from '@ioc:Adonis/Core/Validator/Rules/Password'


validator.rule('password', 
  async (value, [strategyName], options) => {
    const { strategy, name } = PasswordStrategy.use(strategyName)

    if (await strategy.validate(value)) return

    return options.errorReporter.report(
      options.pointer,
      `password.${name}`,
      strategy.message.replace('{{ field }}', options.field),
      strategy.message,
      options.arrayExpressionPointer
    )
  },
  () => ({ async: true })
)

validator.rule('slug', (value, _, options) => {
  const slugPattern = /^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/
  if (slugPattern.test(value)) return

  return options.errorReporter.report(
    options.pointer,
    'slug',
    `${options.field} must be a valid slug`,
    options.arrayExpressionPointer
  )
})

validator.rule(
  'lengthRange',
  (value, { minLen, maxLen }, options) => {
    const report = (subRule: string, message: string) =>
      options.errorReporter.report(
        options.pointer,
        'lengthRange.' + subRule,
        `${options.field} ${message}`,
        options.arrayExpressionPointer
      )

    if (value.length > maxLen) {
      return report('max', `must not exceed ${maxLen} characters`)
    }

    if (value.length < minLen) {
      return report('min', `must have at least ${minLen} characters`)
    }
  },
  (options, type, subtype) => {
    if (subtype !== 'string') {
      throw new Error('"lengthRange" rule can only be used with a string schema type')
    }
    return {
      compiledOptions: {
        minLen: options[0],
        maxLen: options[1],
      },
    }
  }
)