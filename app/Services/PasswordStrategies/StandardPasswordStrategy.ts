import { PasswordValidationStrategy } from '@ioc:Adonis/Core/Validator/Rules/Password'

export default class StandardPasswordStrategy implements PasswordValidationStrategy {
  name = "standard";
  message = '{{ field }} must be at least 6 characters long and include both letters and numbers';
  protected pattern = /^(?=.*[a-zA-Z])(?=.*[0-9]).{6,}$/;

  validate(value: unknown) {
    return typeof value === "string" && this.pattern.test(value);
  }
}