import { PasswordValidationStrategy } from '#interfaces/validation/rules/password'


export default class StandardPasswordStrategy implements PasswordValidationStrategy {
  message = '{{ field }} must be at least 6 characters long and include both letters and numbers'
  protected pattern = /^(?=.*[a-zA-Z])(?=.*[0-9]).{6,}$/

  validate(value: string) {
    return this.pattern.test(value)
  }
}
