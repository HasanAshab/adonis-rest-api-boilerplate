export const customMessages: Record<string, string> = {
  required: '{{ field }} field is required',
  requiredIf: '{{ field }} field is required based on other criteria.',
  file: '{{ field }} field must be a file.',
  alpha: '{{ field }} field must contain only alphabetic characters.',
  alphaNum: '{{ field }} field must contain alpha-numeric characters only.',
  confirmed: '{{ field }} field confirmation does not match.',
  distinct: '{{ field }} field contains duplicate values.',
  email: '{{ field }} field must be a valid email',
  ip: '{{ field }} field must be a valid IP address.',
  maxLength: '{{ field }} field must not exceed {{ options.maxLength }} characters.',
  minLength: '{{ field }} field must have at least {{ options.minLength }} characters.',
  range: '{{ field }} field must be within the range of {{ options.min }} and {{ options.max }}.',
  regex: '{{ field }} field does not match the required pattern.',
  uuid: '{{ field }} field must be a valid UUID.',
  mobile: '{{ field }} field must be a valid mobile number.',
  after: '{{ field }} field must be a date after {{ options.after }}.',
  before: '{{ field }} field must be a date before {{ options.before }}.',
  afterField: '{{ field }} field must be a date after {{ options.afterField }} field.',
  beforeField: '{{ field }} field must be a date before {{ options.beforeField }} field.',
  notIn: '{{ field }} field must not be in the specified list.',
  url: '{{ field }} field must be a valid URL.',
  unique: '{{ field }} already exists',
  exists: "{{ field }} doesn't exist",
  equalTo: '{{ field }} field must be equal to {{ options.equalTo }}.',
  escape: '{{ field }} field must not contain HTML or special characters.',
  trim: '{{ field }} field must not contain leading or trailing spaces.',
}
