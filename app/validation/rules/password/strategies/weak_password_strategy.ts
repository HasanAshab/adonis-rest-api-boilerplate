import { PasswordValidationStrategy } from '@ioc:adonis/core/validator/rules/password'

export default class WeakPasswordStrategy implements PasswordValidationStrategy {
  message = 'must be at least 6 characters long'

  validate(value: unknown) {
    return value.length >= 6
  }
}
