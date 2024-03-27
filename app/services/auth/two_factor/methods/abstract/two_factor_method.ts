import User from '#models/user'
import { Exception } from '@adonisjs/core/exceptions'

export default abstract class TwoFactorMethod {
  abstract methodName: string

  protected assertAssignable(user: User): void | Promise<void> {
    user
  }

  protected abstract verificationFailureException(): Exception
  protected abstract verificationFailureException(user: User): Exception

  protected abstract setup(user: User): void | Promise<void>
  protected abstract cleanup(user: User): void | Promise<void>

  async enable(user: User) {
    await this.assertAssignable(user)
    user.twoFactorEnabled = true
    user.twoFactorMethod = this.methodName
    await this.setup(user)
    await user.save()
  }

  shouldDisable(_: User) {
    return false
  }

  async disable(user: User) {
    if (user.hasEnabledTwoFactorAuth()) {
      user.twoFactorEnabled = false
      await this.cleanup(user)
      await user.save()
    }
  }

  async assign(user: User) {
    await this.assertAssignable(user)
    user.twoFactorMethod = this.methodName
    await user.save()
  }

  challenge(_: User): string | null | Promise<string | null> {
    return null
  }

  abstract isValid(user: User, token: string): boolean | Promise<boolean>

  async verify(user: User, token: string) {
    if (!(await this.isValid(user, token))) {
      throw this.verificationFailureException(user)
    }
  }
}
