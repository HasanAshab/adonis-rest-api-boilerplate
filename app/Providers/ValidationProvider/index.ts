import type { ApplicationContract } from '@ioc:Adonis/Core/Application'
import Config from '@ioc:Adonis/Core/Config'
import PasswordStrategyManager from './Password/PasswordStrategyManager'

export default class ValidationProvider {
  private passwordStrategyManager = new PasswordStrategyManager()

  constructor(protected app: ApplicationContract) {}

  private registerPasswordStrategies() {
    this.app.container.singleton('Adonis/Core/Validator/Rules/Password', () => ({
      PasswordStrategyManager: this.passwordStrategyManager,
    }))
    
    this.passwordStrategyManager.defaultStrategy(
      Config.get('app.constraints.user.password.strategy')
    )
    
    this.passwordStrategyManager.register('standard', () => {
      const StandardPasswordStrategy =
        require('./Password/Strategies/StandardPasswordStrategy').default
      return new StandardPasswordStrategy()
    })

    this.passwordStrategyManager.register('complex', () => {
      const ComplexPasswordStrategy =
        require('./Password/Strategies/ComplexPasswordStrategy').default
      return new ComplexPasswordStrategy()
    })

    this.passwordStrategyManager.register('weak', () => {
      const WeakPasswordStrategy = require('./Password/Strategies/WeakPasswordStrategy').default
      return new WeakPasswordStrategy()
    })
  }

  private addValidationRules() {
    const { validator } = this.app.container.use('Adonis/Core/Validator')

    validator.rule(
      'password',
      async (value, [strategyName], options) => {
        const { strategy, name } = this.passwordStrategyManager.get(strategyName)

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
  }

  public register() {
    this.registerPasswordStrategies()
  }

  public async boot() {
    this.addValidationRules()
  }
}
