import { PasswordValidationStrategy } from '#interfaces/validation/rules/password'

export default class WeakPasswordStrategy implements PasswordValidationStrategy {
  message = '{{ field }} must be at least 6 characters long'

  validate(value: string) {
    return value.length >= 6
  }
}
