import { PasswordValidationStrategy } from '@ioc:Adonis/Core/Validator/Rules/Password'

export default class ComplexPasswordStrategy implements PasswordValidationStrategy {
  name = "complex";
  message = 'must be at least 8 characters long and include at least one lowercase letter, one uppercase letter, one digit, and one special character (@ $ ! % * ? &)';
  protected pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,}$/;

  validate(value: unknown) {
    return typeof value === "string" && this.pattern.test(value);
  }
}