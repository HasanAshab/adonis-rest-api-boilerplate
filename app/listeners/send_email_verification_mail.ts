import { inject } from '@adonisjs/core'
import AuthService from '#services/auth/auth_service'
import type Registered from '#events/registered'

export default class SendEmailVerificationMail {
  @inject()
  async handle(event: Registered, authService: AuthService) {
    await authService.sendVerificationMail(event.user)
  }
}
