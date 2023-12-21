import { CustomMessages } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class Validator {
  constructor(protected ctx: HttpContextContract) {
    this.ctx = ctx;
  }

  public messages: CustomMessages = {
    required: "{{ field }} is required",
    requiredIf: '{{ field }} is required based on other criteria.',
    alpha: '{{ field }} must contain only alphabetic characters.',
    alphaNum: '{{ field }} must contain alpha-numeric characters only.',
    confirmed: '{{ field }} confirmation does not match.',
    distinct: '{{ field }} contains duplicate values.',
    email: '{{ field }} must be a valid email',
    ip: '{{ field }} must be a valid IP address.',
    maxLength: '{{ field }} must not exceed {{ options.maxLength }} characters.',
    minLength: '{{ field }} must have at least {{ options.minLength }} characters.',
    range: '{{ field }} must be within the range of {{ options.min }} and {{ options.max }}.',
    regex: '{{ field }} does not match the required pattern.',
    uuid: '{{ field }} must be a valid UUID.',
    mobile: '{{ field }} must be a valid mobile number.',
    after: '{{ field }} must be a date after {{ options.after }}.',
    before: '{{ field }} must be a date before {{ options.before }}.',
    afterField: '{{ field }} must be a date after {{ options.afterField }} field.',
    beforeField: '{{ field }} must be a date before {{ options.beforeField }} field.',
    notIn: '{{ field }} must not be in the specified list.',
    url: '{{ field }} must be a valid URL.',
    equalTo: '{{ field }} must be equal to {{ options.equalTo }}.',
    escape: '{{ field }} must not contain HTML or special characters.',
    trim: '{{ field }} must not contain leading or trailing spaces.'
  }
}
