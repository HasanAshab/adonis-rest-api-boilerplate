import AuthService from '#services/auth/auth_service'
import type Registered from '#events/registered'


export default class SendEmailVerificationMail {
  public async handle(event: Registered) {
    await AuthService.sendVerificationMail(event.user)
  }
}
